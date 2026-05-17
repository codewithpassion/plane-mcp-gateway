import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	listWorkItemActivities,
	retrieveWorkItemActivity,
} from "../resources/work_item_activities";
import { toolResult } from "./_helpers";

export function registerWorkItemActivityTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_activities",
		"List activities for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(
				async () =>
					(
						await listWorkItemActivities(
							ctx.config,
							ctx.workspaceSlug,
							args.project_id,
							args.work_item_id,
						)
					).results,
			)(),
	);

	server.tool(
		"retrieve_work_item_activity",
		"Retrieve a specific activity for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			activity_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				retrieveWorkItemActivity(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.activity_id,
				),
			)(),
	);
}
