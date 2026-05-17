import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createIntakeWorkItem,
	deleteIntakeWorkItem,
	listIntakeWorkItems,
	retrieveIntakeWorkItem,
	updateIntakeWorkItem,
} from "../resources/intake";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerIntakeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_intake_work_items",
		"List all intake work items in a project.",
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
						await listIntakeWorkItems(
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
		"create_intake_work_item",
		"Create a new intake work item in a project.",
		{
			...pid,
			data: z.record(z.unknown()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				createIntakeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					stripNullish(args.data as Record<string, unknown>),
				),
			)(),
	);

	server.tool(
		"retrieve_intake_work_item",
		"Retrieve an intake work item by work item ID.",
		{
			...pid,
			work_item_id: z.string(),
			expand: z.string().optional(),
			fields: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, ...rest } = a;
			return toolResult(() =>
				retrieveIntakeWorkItem(
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
		"update_intake_work_item",
		"Update an intake work item by work item ID.",
		{
			...pid,
			work_item_id: z.string(),
			data: z.record(z.unknown()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				updateIntakeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					stripNullish(args.data as Record<string, unknown>),
				),
			)(),
	);

	server.tool(
		"delete_intake_work_item",
		"Delete an intake work item by work item ID.",
		{
			...pid,
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteIntakeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
				);
				return { ok: true };
			})(),
	);
}
