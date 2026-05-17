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
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkItemPropertyTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_properties",
		"List work item properties for a work item type.",
		{ project_id: z.string(), type_id: z.string() },
		async (args) =>
			toolResult(() =>
				listWorkItemProperties(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.type_id,
				),
			)(),
	);

	server.tool(
		"create_work_item_property",
		"Create a new work item property.",
		{
			project_id: z.string(),
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
		async (args) => {
			const { project_id, type_id, ...rest } = args;
			return toolResult(() =>
				createWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
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
			project_id: z.string(),
			type_id: z.string(),
			work_item_property_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				retrieveWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.type_id,
					args.work_item_property_id,
				),
			)(),
	);

	server.tool(
		"update_work_item_property",
		"Update a work item property by ID.",
		{
			project_id: z.string(),
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
		async (args) => {
			const { project_id, type_id, work_item_property_id, ...rest } = args;
			return toolResult(() =>
				updateWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
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
			project_id: z.string(),
			type_id: z.string(),
			work_item_property_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await deleteWorkItemProperty(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.type_id,
					args.work_item_property_id,
				);
				return { ok: true };
			})(),
	);
}
