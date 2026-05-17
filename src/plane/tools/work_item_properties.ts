import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkItemProperty,
	deleteWorkItemProperty,
	listWorkItemProperties,
	retrieveWorkItemProperty,
	updateWorkItemProperty,
} from "../resources/work_item_properties";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerWorkItemPropertyTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_item_properties",
		"List work item properties for a work item type.",
		{ ...pid, type_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				listWorkItemProperties(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.type_id as string,
				),
			)(),
	);

	server.tool(
		"create_work_item_property",
		"Create a new work item property.",
		{
			...pid,
			type_id: z.string(),
			display_name: z.string(),
			property_type: z.string(),
			relation_type: z.string().optional(),
			description: z.string().optional(),
			is_required: z.boolean().optional(),
			default_value: z.array(z.string()).optional(),
			settings: z.record(z.string(), z.unknown()).optional(),
			is_active: z.boolean().optional(),
			is_multi: z.boolean().optional(),
			validation_rules: z.record(z.string(), z.unknown()).optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			options: z.array(z.record(z.string(), z.unknown())).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				type_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, type_id, ...rest } = a;
			return toolResult(() =>
				createWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					type_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_work_item_property",
		"Retrieve a work item property by ID.",
		{
			...pid,
			type_id: z.string(),
			work_item_property_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.type_id as string,
					args.work_item_property_id as string,
				),
			)(),
	);

	server.tool(
		"update_work_item_property",
		"Update a work item property by ID.",
		{
			...pid,
			type_id: z.string(),
			work_item_property_id: z.string(),
			display_name: z.string().optional(),
			property_type: z.string().optional(),
			relation_type: z.string().optional(),
			description: z.string().optional(),
			is_required: z.boolean().optional(),
			default_value: z.array(z.string()).optional(),
			settings: z.record(z.string(), z.unknown()).optional(),
			is_active: z.boolean().optional(),
			is_multi: z.boolean().optional(),
			validation_rules: z.record(z.string(), z.unknown()).optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				type_id: string;
				work_item_property_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, type_id, work_item_property_id, ...rest } = a;
			return toolResult(() =>
				updateWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					type_id,
					work_item_property_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_work_item_property",
		"Delete a work item property by ID.",
		{
			...pid,
			type_id: z.string(),
			work_item_property_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.type_id as string,
					args.work_item_property_id as string,
				);
				return { ok: true };
			})(),
	);
}
