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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerWorkItemTypeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_item_types",
		"List all work item types in a project.",
		{ ...pid },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				listWorkItemTypes(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
				),
			)(),
	);

	server.tool(
		"create_work_item_type",
		"Create a new work item type.",
		{
			...pid,
			name: z.string(),
			description: z.string().optional(),
			project_ids: z.array(z.string()).optional(),
			is_epic: z.boolean().optional(),
			is_active: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_work_item_type",
		"Retrieve a work item type by ID.",
		{ ...pid, work_item_type_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_type_id as string,
				),
			)(),
	);

	server.tool(
		"update_work_item_type",
		"Update a work item type by ID.",
		{
			...pid,
			work_item_type_id: z.string(),
			name: z.string().optional(),
			description: z.string().optional(),
			project_ids: z.array(z.string()).optional(),
			is_epic: z.boolean().optional(),
			is_active: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_type_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_type_id, ...rest } = a;
			return toolResult(() =>
				updateWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					work_item_type_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_work_item_type",
		"Delete a work item type by ID.",
		{ ...pid, work_item_type_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_type_id as string,
				);
				return { ok: true };
			})(),
	);
}
