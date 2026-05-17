import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../context";
import { workItemTypes } from "../resources/work_item_types";
import { toolResult } from "./_helpers";

export function registerWorkItemTypeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_types",
		"List all work item types in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async ({ project_id, params }) =>
			toolResult(() =>
				workItemTypes.list(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					params ?? null,
				),
			),
	);

	server.tool(
		"create_work_item_type",
		"Create a new work item type.",
		{
			project_id: z.string().describe("UUID of the project"),
			name: z.string().describe("Work item type name"),
			description: z.string().optional().describe("Work item type description"),
			project_ids: z
				.array(z.string())
				.optional()
				.describe("List of project IDs this type applies to"),
			is_epic: z.boolean().optional().describe("Whether this is an epic type"),
			is_active: z.boolean().optional().describe("Whether the type is active"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async ({
			project_id,
			name,
			description,
			project_ids,
			is_epic,
			is_active,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				workItemTypes.create(ctx.config, ctx.workspaceSlug, project_id, {
					name,
					description,
					project_ids,
					is_epic,
					is_active,
					external_source,
					external_id,
				}),
			),
	);

	server.tool(
		"retrieve_work_item_type",
		"Retrieve a work item type by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_type_id: z.string().describe("UUID of the work item type"),
		},
		async ({ project_id, work_item_type_id }) =>
			toolResult(() =>
				workItemTypes.retrieve(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_type_id,
				),
			),
	);

	server.tool(
		"update_work_item_type",
		"Update a work item type by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_type_id: z.string().describe("UUID of the work item type"),
			name: z.string().optional().describe("Work item type name"),
			description: z.string().optional().describe("Work item type description"),
			project_ids: z
				.array(z.string())
				.optional()
				.describe("List of project IDs this type applies to"),
			is_epic: z.boolean().optional().describe("Whether this is an epic type"),
			is_active: z.boolean().optional().describe("Whether the type is active"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async ({
			project_id,
			work_item_type_id,
			name,
			description,
			project_ids,
			is_epic,
			is_active,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				workItemTypes.update(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_type_id,
					{
						name,
						description,
						project_ids,
						is_epic,
						is_active,
						external_source,
						external_id,
					},
				),
			),
	);

	server.tool(
		"delete_work_item_type",
		"Delete a work item type by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_type_id: z.string().describe("UUID of the work item type"),
		},
		async ({ project_id, work_item_type_id }) =>
			toolResult(() =>
				workItemTypes.delete(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_type_id,
				),
			),
	);
}
