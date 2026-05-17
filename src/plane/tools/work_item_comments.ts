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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerWorkItemCommentTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_item_comments",
		"List comments for a work item.",
		{
			...pid,
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(
				async () =>
					(
						await listWorkItemComments(
							ctx.config,
							ctx.workspaceSlug,
							requireProjectId(ctx, args as { project_id?: string }),
							args.work_item_id as string,
						)
					).results,
			)(),
	);

	server.tool(
		"retrieve_work_item_comment",
		"Retrieve a specific comment for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			comment_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.comment_id as string,
				),
			)(),
	);

	server.tool(
		"create_work_item_comment",
		"Create a comment for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			comment_html: z.string().optional(),
			comment_json: z.record(z.string(), z.unknown()).optional(),
			access: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, ...rest } = a;
			return toolResult(() =>
				createWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
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
			...pid,
			work_item_id: z.string(),
			comment_id: z.string(),
			comment_html: z.string().optional(),
			comment_json: z.record(z.string(), z.unknown()).optional(),
			access: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
				comment_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, comment_id, ...rest } = a;
			return toolResult(() =>
				updateWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
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
			...pid,
			work_item_id: z.string(),
			comment_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteWorkItemComment(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.comment_id as string,
				);
				return { ok: true };
			})(),
	);
}
