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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerWorkItemLinkTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_item_links",
		"List links for a work item.",
		{
			...pid,
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(
				async () =>
					(
						await listWorkItemLinks(
							ctx.config,
							ctx.workspaceSlug,
							requireProjectId(ctx, args as { project_id?: string }),
							args.work_item_id as string,
						)
					).results,
			)(),
	);

	server.tool(
		"retrieve_work_item_link",
		"Retrieve a specific link for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			link_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.link_id as string,
				),
			)(),
	);

	server.tool(
		"create_work_item_link",
		"Create a link for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			url: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				createWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					stripNullish({ url: args.url as string }),
				),
			)(),
	);

	server.tool(
		"update_work_item_link",
		"Update a link for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			link_id: z.string(),
			url: z.string().optional(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				updateWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.link_id as string,
					stripNullish({ url: args.url as string | undefined }),
				),
			)(),
	);

	server.tool(
		"delete_work_item_link",
		"Delete a link for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			link_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteWorkItemLink(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.link_id as string,
				);
				return { ok: true };
			})(),
	);
}
