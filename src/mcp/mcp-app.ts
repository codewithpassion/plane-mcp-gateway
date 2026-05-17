import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import type { PlaneAppContext } from "../plane/client";
import { loadConfig } from "../plane/storage";
import { registerPlaneTools } from "../plane/tools";
import type { Props } from "../utils";

const SLUG_HEADER = "x-plane-config-slug";

interface MCPState {
	slug?: string;
}

export class MyMCP extends McpAgent<Env, MCPState, Props> {
	server = new McpServer({
		name: "Plane MCP Gateway",
		version: "0.1.0",
	});

	private _sealedSlug: string | undefined;
	private _toolsRegistered = false;

	async init(): Promise<void> {
		// Per-slug Plane tools are registered lazily in fetch() once we know
		// the slug + config for this session.
	}

	async fetch(request: Request): Promise<Response> {
		const slug = request.headers.get(SLUG_HEADER) ?? undefined;
		if (!slug) {
			return new Response("Missing Plane config slug", { status: 400 });
		}

		if (this._sealedSlug === undefined) {
			this._sealedSlug = slug;
		} else if (this._sealedSlug !== slug) {
			return new Response(
				`Session sealed to slug "${this._sealedSlug}" but request used "${slug}"`,
				{ status: 400 },
			);
		}

		const userId = this.props?.userId;
		if (!userId) {
			return new Response("Unauthenticated", { status: 401 });
		}

		const record = await loadConfig(this.env.OAUTH_KV, userId, slug);
		if (!record) {
			return new Response(`No Plane config found for slug "${slug}"`, {
				status: 404,
			});
		}

		if (!this._toolsRegistered) {
			const ctx: PlaneAppContext = {
				config: { apiKey: record.apiKey, baseUrl: record.baseUrl },
				workspaceSlug: record.workspaceSlug,
				projectId: record.projectId,
			};
			registerPlaneTools(this.server, ctx);
			this._toolsRegistered = true;
		}

		return super.fetch(request);
	}
}
