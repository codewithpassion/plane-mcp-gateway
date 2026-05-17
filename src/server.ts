import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { apiApp } from "./api";
import { ClerkHandler } from "./clerk-handler";
import { MyMCP } from "./mcp/mcp-app";

const oauthProvider = new OAuthProvider({
	apiHandlers: {
		"/sse": MyMCP.serveSSE("/sse"),
		"/mcp": MyMCP.serve("/mcp"),
	},
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	defaultHandler: ClerkHandler as unknown as ExportedHandler,
	tokenEndpoint: "/token",
});

const SLUG_HEADER = "X-Plane-Config-Slug";
const SLUG_ROUTE_RE = /^\/(mcp|sse)\/([^/]+)(\/.*)?$/;

function rewriteSlugRequest(request: Request): Request | null {
	const url = new URL(request.url);
	const m = SLUG_ROUTE_RE.exec(url.pathname);
	if (!m) return null;
	const [, kind, slug, rest] = m;
	url.pathname = `/${kind}${rest ?? ""}`;
	const headers = new Headers(request.headers);
	headers.set(SLUG_HEADER, slug);
	return new Request(url.toString(), {
		method: request.method,
		headers,
		body: request.body,
		// @ts-expect-error cf-specific flag
		duplex: "half",
	});
}

/**
 * Fix OAuth metadata URLs (HTTPS rewrite) and enrich 401s with
 * resource_metadata WWW-Authenticate per RFC 9728.
 */
async function wrapOAuthResponse(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const response = await oauthProvider.fetch(request, env, ctx);
	const url = new URL(request.url);
	const isHTTPS =
		url.hostname !== "localhost" && !url.hostname.startsWith("127.");

	if (
		isHTTPS &&
		url.pathname === "/.well-known/oauth-authorization-server" &&
		response.status === 200
	) {
		const metadata = await response.json<Record<string, unknown>>();
		const fixedMetadata = JSON.parse(
			JSON.stringify(metadata).replace(
				new RegExp(`http://${url.hostname}`, "g"),
				`https://${url.hostname}`,
			),
		);
		return new Response(JSON.stringify(fixedMetadata), {
			status: response.status,
			statusText: response.statusText,
			headers: new Headers(response.headers),
		});
	}

	if (response.status === 401) {
		if (isHTTPS) url.protocol = "https:";
		url.pathname = "/.well-known/oauth-protected-resource";
		url.search = "";
		url.hash = "";
		const resourceMetadataUrl = url.href;
		const existingAuth = response.headers.get("WWW-Authenticate");
		const newHeaders = new Headers(response.headers);
		if (existingAuth) {
			newHeaders.set(
				"WWW-Authenticate",
				`${existingAuth}, resource_metadata="${resourceMetadataUrl}"`,
			);
		} else {
			newHeaders.set(
				"WWW-Authenticate",
				`Bearer resource_metadata="${resourceMetadataUrl}"`,
			);
		}
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: newHeaders,
		});
	}
	return response;
}

const OAUTH_PATHS = new Set(["/authorize", "/callback", "/register", "/token"]);

export { MyMCP };

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		if (SLUG_ROUTE_RE.test(url.pathname)) {
			const rewritten = rewriteSlugRequest(request);
			if (rewritten) return wrapOAuthResponse(rewritten, env, ctx);
		}

		if (
			OAUTH_PATHS.has(url.pathname) ||
			url.pathname.startsWith("/.well-known/")
		) {
			return wrapOAuthResponse(request, env, ctx);
		}

		if (url.pathname.startsWith("/api/")) {
			const subPath = url.pathname.slice(4); // strip "/api"
			const subUrl = new URL(subPath || "/", url.origin);
			subUrl.search = url.search;
			const subReq = new Request(subUrl.toString(), {
				method: request.method,
				headers: request.headers,
				body: request.body,
				// @ts-expect-error cf-specific flag
				duplex: "half",
			});
			return apiApp.fetch(subReq, env, ctx);
		}

		// UI handler — TanStack Start server entry (scaffolded under app/).
		// Dynamic specifier so the worker still type-checks when the UI module
		// hasn't been generated yet.
		try {
			const uiSpecifier: string = "../app/server-entry";
			const mod = (await import(/* @vite-ignore */ uiSpecifier)) as {
				default: ExportedHandler<Env>;
			};
			return (
				(await mod.default.fetch?.(
					request as unknown as Parameters<
						NonNullable<ExportedHandler<Env>["fetch"]>
					>[0],
					env,
					ctx,
				)) ?? new Response("UI not available", { status: 503 })
			);
		} catch {
			return new Response(
				`<!doctype html><meta charset=utf-8><title>plane-mcp-gw</title>` +
					`<body style="font-family:system-ui;padding:2rem">` +
					`<h1>plane-mcp-gw</h1>` +
					`<p>UI not built yet. POST /api/configs to manage configurations, ` +
					`then connect MCP clients to <code>/mcp/&lt;slug&gt;</code>.</p>`,
				{ headers: { "content-type": "text/html; charset=utf-8" } },
			);
		}
	},
} satisfies ExportedHandler<Env>;
