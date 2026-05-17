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
import { stripNullish, toolResult } from "./_helpers";

export function registerMilestoneTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_milestones",
		"List all milestones in a project.",
		{
			project_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listMilestones(
							ctx.config,
							ctx.workspaceSlug,
							project_id,
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
			project_id: z.string(),
			title: z.string(),
			target_date: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createMilestone(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_milestone",
		"Retrieve a milestone by ID.",
		{
			project_id: z.string(),
			milestone_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				retrieveMilestone(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.milestone_id,
				),
			)(),
	);

	server.tool(
		"update_milestone",
		"Update a milestone by ID.",
		{
			project_id: z.string(),
			milestone_id: z.string(),
			title: z.string().optional(),
			target_date: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, milestone_id, ...rest } = args;
			return toolResult(() =>
				updateMilestone(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
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
			project_id: z.string(),
			milestone_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await deleteMilestone(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.milestone_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"add_work_items_to_milestone",
		"Add work items to a milestone.",
		{
			project_id: z.string(),
			milestone_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args) =>
			toolResult(async () => {
				await addWorkItemsToMilestone(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.milestone_id,
					args.work_item_ids,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_items_from_milestone",
		"Remove work items from a milestone.",
		{
			project_id: z.string(),
			milestone_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args) =>
			toolResult(async () => {
				await removeWorkItemsFromMilestone(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.milestone_id,
					args.work_item_ids,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_milestone_work_items",
		"List work items in a milestone.",
		{
			project_id: z.string(),
			milestone_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args) => {
			const { project_id, milestone_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listMilestoneWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							project_id,
							milestone_id,
							stripNullish(rest),
						)
					).results,
			)();
		},
	);
}
