import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import { workItems } from "../resources/work_items";
import { toolResult } from "./_helpers";

export function registerWorkItemActivityTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_activities",
		"List activities for a work item.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_id: z.string().describe("UUID of the work item"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async (args) =>
			toolResult(async () => {
				const response = await workItems.listActivities(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"retrieve_work_item_activity",
		"Retrieve a specific activity for a work item.",
		{
			project_id: z.string().describe("UUID of the project"),
			work_item_id: z.string().describe("UUID of the work item"),
			activity_id: z.string().describe("UUID of the activity"),
		},
		async (args) =>
			toolResult(() =>
				workItems.retrieveActivity(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.activity_id,
				),
			),
	);
}
