import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	addWorkItemsToMilestone,
	createMilestone,
	deleteMilestone,
	listMilestones,
	listMilestoneWorkItems,
	removeWorkItemsFromMilestone,
	retrieveMilestone,
	updateMilestone,
} from "../resources/milestones";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerMilestoneTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_milestones",
		"List all milestones in a project.",
		{
			...pid,
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listMilestones(
							ctx.config,
							ctx.workspaceSlug,
							projectId,
							stripNullish(rest),
						)
					).results,
			)();
		},
	);

	server.tool(
		"create_milestone",
		"Create a new milestone.",
		{
			...pid,
			title: z.string(),
			target_date: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createMilestone(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_milestone",
		"Retrieve a milestone by ID.",
		{
			...pid,
			milestone_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveMilestone(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.milestone_id as string,
				),
			)(),
	);

	server.tool(
		"update_milestone",
		"Update a milestone by ID.",
		{
			...pid,
			milestone_id: z.string(),
			title: z.string().optional(),
			target_date: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				milestone_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, milestone_id, ...rest } = a;
			return toolResult(() =>
				updateMilestone(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					milestone_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_milestone",
		"Delete a milestone by ID.",
		{
			...pid,
			milestone_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteMilestone(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.milestone_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"add_work_items_to_milestone",
		"Add work items to a milestone.",
		{
			...pid,
			milestone_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await addWorkItemsToMilestone(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.milestone_id as string,
					args.work_item_ids as string[],
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_items_from_milestone",
		"Remove work items from a milestone.",
		{
			...pid,
			milestone_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await removeWorkItemsFromMilestone(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.milestone_id as string,
					args.work_item_ids as string[],
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_milestone_work_items",
		"List work items in a milestone.",
		{
			...pid,
			milestone_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				milestone_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, milestone_id, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listMilestoneWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							projectId,
							milestone_id,
							stripNullish(rest),
						)
					).results,
			)();
		},
	);
}
