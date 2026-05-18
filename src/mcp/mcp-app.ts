import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import type { PlaneAppContext } from "../plane/client";
import { loadConfig, type PlaneConfigRecord } from "../plane/storage";
import { registerPlaneTools } from "../plane/tools";
import type { Props } from "../utils";
import {
	fetchProjects,
	fetchWorkspaceName,
	type PlaneProjectSummary,
	renderInstructions,
} from "./instructions";

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
	private _cachedProjects: PlaneProjectSummary[] | undefined;
	private _cachedWorkspaceName: string | undefined;

	async init(): Promise<void> {
		// Register a no-op stub tool BEFORE the transport connects so that
		// the tools/list and tools/call request handlers are wired up at
		// capability negotiation time. Without this, the first tool
		// registration after the transport connects (during applyConfig)
		// throws "Cannot register capabilities after connecting to
		// transport". The stub is replaced with the real tool set on the
		// first authenticated request via applyConfig().
		this.server.tool(
			"_bootstrap",
			"Internal bootstrap tool; replaced once a Plane config is loaded.",
			{},
			async () => ({
				content: [
					{
						type: "text",
						text: "Plane tools not yet loaded for this session.",
					},
				],
			}),
		);
	}

	private async applyConfig(record: PlaneConfigRecord): Promise<void> {
		for (const t of this._registered) {
			try {
				t.remove?.();
			} catch {
				/* ignore */
			}
		}
		this._registered = [];

		// Pull projects + workspace metadata in parallel for the
		// instructions block. Cache them on the DO so subsequent
		// re-applies for the same config don't re-fetch.
		const [projects, workspaceName] = await Promise.all([
			this._cachedProjects ?? fetchProjects(record),
			this._cachedWorkspaceName !== undefined
				? Promise.resolve(this._cachedWorkspaceName)
				: fetchWorkspaceName(record),
		]);
		this._cachedProjects = projects;
		this._cachedWorkspaceName = workspaceName;

		const instructions = renderInstructions({
			record,
			workspaceName,
			projects,
		});
		console.log("[mcp-app] instructions:\n", instructions);

		// Mutate the underlying Server's instructions so InitializeResult
		// reflects them on the very first response. This is safe to do
		// before the transport connects (during init) AND after — the
		// SDK serializes them at response time.
		(this.server.server as unknown as { instructions?: string }).instructions =
			instructions;

		// Wrap server.tool() so every registration is captured for later
		// remove(), without threading callbacks through every register*.
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
		const url = new URL(request.url);

		// Partyserver/agents framework internal paths must reach super.fetch
		// untouched so the DO can be named and props can propagate.
		if (url.pathname.startsWith("/cdn-cgi/")) {
			return super.fetch(request);
		}

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
			this._cachedProjects = undefined;
			this._cachedWorkspaceName = undefined;
			return new Response(`Plane config "${slug}" no longer exists`, {
				status: 410,
			});
		}

		if (this._lastUpdatedAt !== record.updatedAt) {
			// Invalidate cached metadata when the config (workspace/apiKey)
			// may have changed.
			this._cachedProjects = undefined;
			this._cachedWorkspaceName = undefined;
			await this.applyConfig(record);
		}

		return super.fetch(request);
	}
}
