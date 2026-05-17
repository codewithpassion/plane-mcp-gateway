import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	addWorkItemsToCycle,
	archiveCycle,
	createCycle,
	deleteCycle,
	listArchivedCycles,
	listCycles,
	listCycleWorkItems,
	removeWorkItemFromCycle,
	retrieveCycle,
	transferCycleWorkItems,
	unarchiveCycle,
	updateCycle,
} from "../resources/cycles";
import { stripNullish, toolResult } from "./_helpers";

export function registerCycleTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_cycles",
		"List all cycles in a project.",
		{
			project_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listCycles(
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
		"create_cycle",
		"Create a new cycle.",
		{
			project_id: z.string(),
			name: z.string(),
			owned_by: z.string(),
			description: z.string().optional(),
			start_date: z.string().optional(),
			end_date: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			timezone: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createCycle(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish({ ...rest, project_id }),
				),
			)();
		},
	);

	server.tool(
		"retrieve_cycle",
		"Retrieve a cycle by ID.",
		{ project_id: z.string(), cycle_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveCycle(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
				),
			)(),
	);

	server.tool(
		"update_cycle",
		"Update a cycle by ID.",
		{
			project_id: z.string(),
			cycle_id: z.string(),
			name: z.string().optional(),
			description: z.string().optional(),
			start_date: z.string().optional(),
			end_date: z.string().optional(),
			owned_by: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			timezone: z.string().optional(),
		},
		async (args) => {
			const { project_id, cycle_id, ...rest } = args;
			return toolResult(() =>
				updateCycle(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					cycle_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_cycle",
		"Delete a cycle by ID.",
		{ project_id: z.string(), cycle_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteCycle(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_archived_cycles",
		"List archived cycles in a project.",
		{
			project_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listArchivedCycles(
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
		"add_work_items_to_cycle",
		"Add work items to a cycle.",
		{
			project_id: z.string(),
			cycle_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args) =>
			toolResult(async () => {
				await addWorkItemsToCycle(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
					args.work_item_ids,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_item_from_cycle",
		"Remove a work item from a cycle.",
		{
			project_id: z.string(),
			cycle_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await removeWorkItemFromCycle(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
					args.work_item_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_cycle_work_items",
		"List work items in a cycle.",
		{
			project_id: z.string(),
			cycle_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args) => {
			const { project_id, cycle_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listCycleWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							project_id,
							cycle_id,
							stripNullish(rest),
						)
					).results,
			)();
		},
	);

	server.tool(
		"transfer_cycle_work_items",
		"Transfer work items from one cycle to another.",
		{
			project_id: z.string(),
			cycle_id: z.string(),
			new_cycle_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await transferCycleWorkItems(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
					args.new_cycle_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"archive_cycle",
		"Archive a cycle.",
		{ project_id: z.string(), cycle_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await archiveCycle(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"unarchive_cycle",
		"Unarchive a cycle.",
		{ project_id: z.string(), cycle_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await unarchiveCycle(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.cycle_id,
				);
				return { ok: true };
			})(),
	);
}
