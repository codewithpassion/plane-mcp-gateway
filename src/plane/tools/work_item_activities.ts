import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	listWorkItemActivities,
	retrieveWorkItemActivity,
} from "../resources/work_item_activities";
import { projectIdField, requireProjectId, toolResult } from "./_helpers";

export function registerWorkItemActivityTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_item_activities",
		"List activities for a work item.",
		{
			...pid,
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(
				async () =>
					(
						await listWorkItemActivities(
							ctx.config,
							ctx.workspaceSlug,
							requireProjectId(ctx, args as { project_id?: string }),
							args.work_item_id as string,
						)
					).results,
			)(),
	);

	server.tool(
		"retrieve_work_item_activity",
		"Retrieve a specific activity for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			activity_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveWorkItemActivity(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.activity_id as string,
				),
			)(),
	);
}
