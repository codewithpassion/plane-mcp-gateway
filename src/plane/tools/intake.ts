import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import { intake } from "../resources/intake";
import { toolResult } from "./_helpers";

export function registerIntakeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_intake_work_items",
		"List all intake work items in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			params: z
				.record(z.unknown())
				.optional()
				.describe(
					"Optional query parameters as a dictionary (e.g., per_page, cursor)",
				),
		},
		async ({ project_id, params }) =>
			toolResult(async () => {
				const response = await intake.list(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"create_intake_work_item",
		"Create a new intake work item in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			data: z
				.record(z.unknown())
				.describe("Intake work item data as a dictionary"),
		},
		async ({ project_id, data }) =>
			toolResult(() =>
				intake.create(ctx.config, ctx.workspaceSlug, project_id, data),
			),
	);

	server.tool(
		"retrieve_intake_work_item",
		"Retrieve an intake work item by work item ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_id: z
				.string()
				.describe(
					"UUID of the work item (use the issue field from IntakeWorkItem response, not the intake work item ID)",
				),
			params: z
				.record(z.unknown())
				.optional()
				.describe(
					"Optional query parameters as a dictionary (e.g., expand, fields)",
				),
		},
		async ({ project_id, work_item_id, params }) =>
			toolResult(() =>
				intake.retrieve(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_id,
					params ?? null,
				),
			),
	);

	server.tool(
		"update_intake_work_item",
		"Update an intake work item by work item ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_id: z
				.string()
				.describe(
					"UUID of the work item (use the issue field from IntakeWorkItem response, not the intake work item ID)",
				),
			data: z
				.record(z.unknown())
				.describe("Updated intake work item data as a dictionary"),
		},
		async ({ project_id, work_item_id, data }) =>
			toolResult(() =>
				intake.update(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_id,
					data,
				),
			),
	);

	server.tool(
		"delete_intake_work_item",
		"Delete an intake work item by work item ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_id: z
				.string()
				.describe(
					"UUID of the work item (use the issue field from IntakeWorkItem response, not the intake work item ID)",
				),
		},
		async ({ project_id, work_item_id }) =>
			toolResult(() =>
				intake.delete(ctx.config, ctx.workspaceSlug, project_id, work_item_id),
			),
	);
}
