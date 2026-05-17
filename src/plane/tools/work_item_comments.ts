import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkItemComment,
	deleteWorkItemComment,
	listWorkItemComments,
	retrieveWorkItemComment,
	updateWorkItemComment,
} from "../resources/work_item_comments";
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkItemCommentTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_comments",
		"List comments for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(
				async () =>
					(
						await listWorkItemComments(
							ctx.config,
							ctx.workspaceSlug,
							args.project_id,
							args.work_item_id,
						)
					).results,
			)(),
	);

	server.tool(
		"retrieve_work_item_comment",
		"Retrieve a specific comment for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			comment_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				retrieveWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.comment_id,
				),
			)(),
	);

	server.tool(
		"create_work_item_comment",
		"Create a comment for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			comment_html: z.string().optional(),
			comment_json: z.record(z.string(), z.unknown()).optional(),
			access: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, ...rest } = args;
			return toolResult(() =>
				createWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"update_work_item_comment",
		"Update a comment for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			comment_id: z.string(),
			comment_html: z.string().optional(),
			comment_json: z.record(z.string(), z.unknown()).optional(),
			access: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, comment_id, ...rest } = args;
			return toolResult(() =>
				updateWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_id,
					comment_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_work_item_comment",
		"Delete a comment for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			comment_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await deleteWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.comment_id,
				);
				return { ok: true };
			})(),
	);
}
