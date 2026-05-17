import OAuthProvider from "@cloudflare/workers-oauth-provider";
import {
	McpServer,
	type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { ClerkHandler } from "../clerk-handler";
import { loadConfig } from "../plane/storage";
import { registerPlaneTools } from "../plane/tools";
import type { Props } from "../utils";

/**
 * Run `registerPlaneTools` while intercepting `server.tool` so we capture
 * every `RegisteredTool` it produces. Lets us tear them all down later
 * when the underlying config changes.
 */
function registerPlaneToolsTracked(
	server: McpServer,
	ctx: Parameters<typeof registerPlaneTools>[1],
): RegisteredTool[] {
	const tracked: RegisteredTool[] = [];
	const originalTool = server.tool.bind(server) as typeof server.tool;
	(server as { tool: typeof server.tool }).tool = ((
		...args: Parameters<typeof server.tool>
	) => {
		const result = originalTool(...args);
		tracked.push(result);
		return result;
	}) as typeof server.tool;
	try {
		registerPlaneTools(server, ctx);
	} finally {
		(server as { tool: typeof server.tool }).tool = originalTool;
	}
	return tracked;
}

export class MyMCP extends McpAgent<Env, Record<string, never>, Props> {
	server = new McpServer({
		name: "Plane MCP Gateway",
		version: "1.0.0",
	});

	private slug?: string;
	private planeTools: RegisteredTool[] = [];
	private planeCfgVersion?: string;

	async init() {}

	async fetch(request: Request): Promise<Response> {
		const slug = request.headers.get("X-Plane-Config-Slug") ?? undefined;
		if (slug && !this.slug) this.slug = slug;
		if (slug && this.slug && slug !== this.slug) {
			return new Response("session/slug mismatch", { status: 400 });
		}
		if (this.slug) {
			const cfg = await loadConfig(
				this.env,
				this.props?.userId ?? "",
				this.slug,
			);
			if (!cfg) {
				// Config deleted while session is live — drop tools and 410.
				// MCP client will see toolListChanged + an unknown-config error
				// on its next call.
				if (this.planeTools.length) {
					for (const t of this.planeTools) t.remove();
					this.planeTools = [];
					this.planeCfgVersion = undefined;
				}
				return new Response("plane config no longer exists", { status: 410 });
			}
			if (this.planeCfgVersion !== cfg.updatedAt) {
				for (const t of this.planeTools) t.remove();
				this.planeTools = registerPlaneToolsTracked(this.server, {
					config: {
						baseUrl: cfg.baseUrl ?? "https://api.plane.so",
						apiKey: cfg.apiKey,
					},
					workspaceSlug: cfg.planeWorkspaceSlug,
					projectId: cfg.projectId,
				});
				this.planeCfgVersion = cfg.updatedAt;
			}
		}
		return super.fetch(request);
	}
}

export const oauthProvider = new OAuthProvider({
	apiHandlers: {
		"/sse": MyMCP.serveSSE("/sse"),
		"/mcp": MyMCP.serve("/mcp"),
	},
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	defaultHandler: ClerkHandler as unknown as ExportedHandler,
	tokenEndpoint: "/token",
});

/**
 * Apply two transformations on responses coming back from oauthProvider:
 *  - rewrite http:// to https:// in OAuth Authorization Server metadata for tunnels
 *  - add resource_metadata to WWW-Authenticate on 401 (RFC 9728)
 */
export async function wrapOAuthResponse(
	response: Response,
	request: Request,
): Promise<Response> {
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
