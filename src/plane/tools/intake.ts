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
import { stripNullish, toolResult } from "./_helpers";

export function registerIntakeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_intake_work_items",
		"List all intake work items in a project.",
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
						await listIntakeWorkItems(
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
		"create_intake_work_item",
		"Create a new intake work item in a project.",
		{
			project_id: z.string(),
			data: z.record(z.unknown()),
		},
		async (args) =>
			toolResult(() =>
				createIntakeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					stripNullish(args.data),
				),
			)(),
	);

	server.tool(
		"retrieve_intake_work_item",
		"Retrieve an intake work item by work item ID.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			expand: z.string().optional(),
			fields: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, ...rest } = args;
			return toolResult(() =>
				retrieveIntakeWorkItem(
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
		"update_intake_work_item",
		"Update an intake work item by work item ID.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			data: z.record(z.unknown()),
		},
		async (args) =>
			toolResult(() =>
				updateIntakeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					stripNullish(args.data),
				),
			)(),
	);

	server.tool(
		"delete_intake_work_item",
		"Delete an intake work item by work item ID.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await deleteIntakeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
				);
				return { ok: true };
			})(),
	);
}
