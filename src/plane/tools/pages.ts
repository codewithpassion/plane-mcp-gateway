import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import { pages } from "../resources/pages";
import type { CreatePageBody } from "../types/pages";
import { toolResult } from "./_helpers";

export function registerPageTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"retrieve_workspace_page",
		"Retrieve a workspace page by ID.",
		{
			page_id: z.string().describe("UUID of the page"),
		},
		async ({ page_id }) =>
			toolResult(() =>
				pages.retrieveWorkspacePage(ctx.config, ctx.workspaceSlug, page_id),
			),
	);

	server.tool(
		"retrieve_project_page",
		"Retrieve a project page by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			page_id: z.string().describe("UUID of the page"),
		},
		async ({ project_id, page_id }) =>
			toolResult(() =>
				pages.retrieveProjectPage(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					page_id,
				),
			),
	);

	server.tool(
		"create_workspace_page",
		"Create a workspace page.",
		{
			name: z.string().describe("Page name"),
			description_html: z.string().describe("Page content in HTML format"),
			access: z
				.number()
				.int()
				.optional()
				.describe("Access level for the page (integer)"),
			color: z.string().optional().describe("Page color"),
			is_locked: z.boolean().optional().describe("Whether the page is locked"),
			archived_at: z
				.string()
				.optional()
				.describe("Archive timestamp (ISO 8601 format)"),
			view_props: z
				.record(z.unknown())
				.optional()
				.describe("View properties dictionary"),
			logo_props: z
				.record(z.unknown())
				.optional()
				.describe("Logo properties dictionary"),
			external_id: z.string().optional().describe("External system identifier"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
		},
		async (params) =>
			toolResult(() =>
				pages.createWorkspacePage(
					ctx.config,
					ctx.workspaceSlug,
					params as CreatePageBody,
				),
			),
	);

	server.tool(
		"create_project_page",
		"Create a project page.",
		{
			project_id: z.string().describe("UUID of the project"),
			name: z.string().describe("Page name"),
			description_html: z.string().describe("Page content in HTML format"),
			access: z
				.number()
				.int()
				.optional()
				.describe("Access level for the page (integer)"),
			color: z.string().optional().describe("Page color"),
			is_locked: z.boolean().optional().describe("Whether the page is locked"),
			archived_at: z
				.string()
				.optional()
				.describe("Archive timestamp (ISO 8601 format)"),
			view_props: z
				.record(z.unknown())
				.optional()
				.describe("View properties dictionary"),
			logo_props: z
				.record(z.unknown())
				.optional()
				.describe("Logo properties dictionary"),
			external_id: z.string().optional().describe("External system identifier"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
		},
		async ({ project_id, ...rest }) =>
			toolResult(() =>
				pages.createProjectPage(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					rest as CreatePageBody,
				),
			),
	);
}
