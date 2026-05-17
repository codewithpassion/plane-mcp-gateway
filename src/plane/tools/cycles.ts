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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerCycleTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_cycles",
		"List all cycles in a project.",
		{
			...pid,
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listCycles(
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
		"create_cycle",
		"Create a new cycle.",
		{
			...pid,
			name: z.string(),
			owned_by: z.string(),
			description: z.string().optional(),
			start_date: z.string().optional(),
			end_date: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			timezone: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createCycle(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish({ ...rest, project_id: projectId }),
				),
			)();
		},
	);

	server.tool(
		"retrieve_cycle",
		"Retrieve a cycle by ID.",
		{ ...pid, cycle_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveCycle(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
				),
			)(),
	);

	server.tool(
		"update_cycle",
		"Update a cycle by ID.",
		{
			...pid,
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
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				cycle_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, cycle_id, ...rest } = a;
			return toolResult(() =>
				updateCycle(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					cycle_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_cycle",
		"Delete a cycle by ID.",
		{ ...pid, cycle_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteCycle(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_archived_cycles",
		"List archived cycles in a project.",
		{
			...pid,
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listArchivedCycles(
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
		"add_work_items_to_cycle",
		"Add work items to a cycle.",
		{
			...pid,
			cycle_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await addWorkItemsToCycle(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
					args.work_item_ids as string[],
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_item_from_cycle",
		"Remove a work item from a cycle.",
		{
			...pid,
			cycle_id: z.string(),
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await removeWorkItemFromCycle(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
					args.work_item_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_cycle_work_items",
		"List work items in a cycle.",
		{
			...pid,
			cycle_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				cycle_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, cycle_id, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listCycleWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							projectId,
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
			...pid,
			cycle_id: z.string(),
			new_cycle_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await transferCycleWorkItems(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
					args.new_cycle_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"archive_cycle",
		"Archive a cycle.",
		{ ...pid, cycle_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await archiveCycle(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"unarchive_cycle",
		"Unarchive a cycle.",
		{ ...pid, cycle_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await unarchiveCycle(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.cycle_id as string,
				);
				return { ok: true };
			})(),
	);
}
