import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import type { PlaneAppContext } from "../plane/client";
import { loadConfig, type PlaneConfigRecord } from "../plane/storage";
import { registerPlaneTools } from "../plane/tools";
import type { Props } from "../utils";

const SLUG_HEADER = "x-plane-config-slug";

interface MCPState {
	slug?: string;
}

interface Removable {
	remove?: () => void;
}

export class MyMCP extends McpAgent<Env, MCPState, Props> {
	server = new McpServer({
		name: "Plane MCP Gateway",
		version: "0.1.0",
	});

	private _sealedSlug: string | undefined;
	private _lastUpdatedAt: string | undefined;
	private _registered: Removable[] = [];

	async init(): Promise<void> {
		// Per-slug Plane tools are loaded lazily in fetch().
	}

	private applyConfig(record: PlaneConfigRecord): void {
		for (const t of this._registered) {
			try {
				t.remove?.();
			} catch {
				/* ignore */
			}
		}
		this._registered = [];

		// Wrap server.tool() so every registration is captured, without
		// having to thread a callback through every register*Tools call.
		const realTool = this.server.tool.bind(this.server);
		const tracked: McpServer["tool"] = ((...args: unknown[]) => {
			const result = (realTool as (...a: unknown[]) => unknown)(...args);
			if (result && typeof result === "object" && "remove" in result) {
				this._registered.push(result as Removable);
			}
			return result as ReturnType<McpServer["tool"]>;
		}) as McpServer["tool"];

		(this.server as unknown as { tool: McpServer["tool"] }).tool = tracked;
		try {
			const ctx: PlaneAppContext = {
				config: { apiKey: record.apiKey, baseUrl: record.baseUrl },
				workspaceSlug: record.workspaceSlug,
				projectId: record.projectId,
			};
			registerPlaneTools(this.server, ctx);
		} finally {
			(this.server as unknown as { tool: McpServer["tool"] }).tool = realTool;
		}
		this._lastUpdatedAt = record.updatedAt;
	}

	async fetch(request: Request): Promise<Response> {
		const slug = request.headers.get(SLUG_HEADER) ?? undefined;
		if (!slug)
			return new Response("Missing Plane config slug", { status: 400 });

		if (this._sealedSlug === undefined) {
			this._sealedSlug = slug;
		} else if (this._sealedSlug !== slug) {
			return new Response(
				`Session sealed to slug "${this._sealedSlug}" but request used "${slug}"`,
				{ status: 400 },
			);
		}

		const userId = this.props?.userId;
		if (!userId) return new Response("Unauthenticated", { status: 401 });

		const record = await loadConfig(this.env.OAUTH_KV, userId, slug);
		if (!record) {
			for (const t of this._registered) {
				try {
					t.remove?.();
				} catch {
					/* ignore */
				}
			}
			this._registered = [];
			this._lastUpdatedAt = undefined;
			return new Response(`Plane config "${slug}" no longer exists`, {
				status: 410,
			});
		}

		if (this._lastUpdatedAt !== record.updatedAt) {
			this.applyConfig(record);
		}

		return super.fetch(request);
	}
}
