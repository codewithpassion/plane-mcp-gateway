import OAuthProvider from "@cloudflare/workers-oauth-provider";
import handler from "@tanstack/react-start/server-entry";
import { apiApp } from "../src/api";
import { ClerkHandler } from "../src/clerk-handler";
import { MyMCP } from "../src/mcp/mcp-app";

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
			const subPath = url.pathname.slice(4);
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

		// Everything else → TanStack Start UI (SSR + assets).
		return handler.fetch(request);
	},
} satisfies ExportedHandler<Env>;
