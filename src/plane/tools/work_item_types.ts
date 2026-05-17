import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkItemType,
	deleteWorkItemType,
	listWorkItemTypes,
	retrieveWorkItemType,
	updateWorkItemType,
} from "../resources/work_item_types";
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkItemTypeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_types",
		"List all work item types in a project.",
		{ project_id: z.string() },
		async (args) =>
			toolResult(() =>
				listWorkItemTypes(ctx.config, ctx.workspaceSlug, args.project_id),
			)(),
	);

	server.tool(
		"create_work_item_type",
		"Create a new work item type.",
		{
			project_id: z.string(),
			name: z.string(),
			description: z.string().optional(),
			project_ids: z.array(z.string()).optional(),
			is_epic: z.boolean().optional(),
			is_active: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_work_item_type",
		"Retrieve a work item type by ID.",
		{ project_id: z.string(), work_item_type_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_type_id,
				),
			)(),
	);

	server.tool(
		"update_work_item_type",
		"Update a work item type by ID.",
		{
			project_id: z.string(),
			work_item_type_id: z.string(),
			name: z.string().optional(),
			description: z.string().optional(),
			project_ids: z.array(z.string()).optional(),
			is_epic: z.boolean().optional(),
			is_active: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_type_id, ...rest } = args;
			return toolResult(() =>
				updateWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_type_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_work_item_type",
		"Delete a work item type by ID.",
		{ project_id: z.string(), work_item_type_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_type_id,
				);
				return { ok: true };
			})(),
	);
}
