import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createProjectPage,
	createWorkspacePage,
	retrieveProjectPage,
	retrieveWorkspacePage,
} from "../resources/pages";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerPageTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"retrieve_workspace_page",
		"Retrieve a workspace page by ID.",
		{ page_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveWorkspacePage(ctx.config, ctx.workspaceSlug, args.page_id),
			)(),
	);

	server.tool(
		"retrieve_project_page",
		"Retrieve a project page by ID.",
		{
			...pid,
			page_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveProjectPage(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.page_id as string,
				),
			)(),
	);

	server.tool(
		"create_workspace_page",
		"Create a workspace page.",
		{
			name: z.string(),
			description_html: z.string(),
			access: z.number().int().optional(),
			color: z.string().optional(),
			is_locked: z.boolean().optional(),
			archived_at: z.string().optional(),
			view_props: z.record(z.unknown()).optional(),
			logo_props: z.record(z.unknown()).optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
		},
		async (args) =>
			toolResult(() =>
				createWorkspacePage(ctx.config, ctx.workspaceSlug, stripNullish(args)),
			)(),
	);

	server.tool(
		"create_project_page",
		"Create a project page.",
		{
			...pid,
			name: z.string(),
			description_html: z.string(),
			access: z.number().int().optional(),
			color: z.string().optional(),
			is_locked: z.boolean().optional(),
			archived_at: z.string().optional(),
			view_props: z.record(z.unknown()).optional(),
			logo_props: z.record(z.unknown()).optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createProjectPage(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);
}
