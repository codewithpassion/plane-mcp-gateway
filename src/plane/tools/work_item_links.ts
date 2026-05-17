import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkItemLink,
	deleteWorkItemLink,
	listWorkItemLinks,
	retrieveWorkItemLink,
	updateWorkItemLink,
} from "../resources/work_item_links";
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkItemLinkTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_links",
		"List links for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(
				async () =>
					(
						await listWorkItemLinks(
							ctx.config,
							ctx.workspaceSlug,
							args.project_id,
							args.work_item_id,
						)
					).results,
			)(),
	);

	server.tool(
		"retrieve_work_item_link",
		"Retrieve a specific link for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			link_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				retrieveWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.link_id,
				),
			)(),
	);

	server.tool(
		"create_work_item_link",
		"Create a link for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			url: z.string(),
		},
		async (args) =>
			toolResult(() =>
				createWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					stripNullish({ url: args.url }),
				),
			)(),
	);

	server.tool(
		"update_work_item_link",
		"Update a link for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			link_id: z.string(),
			url: z.string().optional(),
		},
		async (args) =>
			toolResult(() =>
				updateWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.link_id,
					stripNullish({ url: args.url }),
				),
			)(),
	);

	server.tool(
		"delete_work_item_link",
		"Delete a link for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			link_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await deleteWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.link_id,
				);
				return { ok: true };
			})(),
	);
}
