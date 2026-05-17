import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createProjectPage,
	createWorkspacePage,
	retrieveProjectPage,
	retrieveWorkspacePage,
} from "../resources/pages";
import { stripNullish, toolResult } from "./_helpers";

export function registerPageTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
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
			project_id: z.string(),
			page_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				retrieveProjectPage(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.page_id,
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
			project_id: z.string(),
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
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createProjectPage(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);
}
