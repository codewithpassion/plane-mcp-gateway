import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkLog,
	deleteWorkLog,
	listWorkLogs,
	updateWorkLog,
} from "../resources/work_logs";
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkLogTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_logs",
		"List work logs for a work item.",
		{ project_id: z.string(), work_item_id: z.string() },
		async (args) =>
			toolResult(() =>
				listWorkLogs(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
				),
			)(),
	);

	server.tool(
		"create_work_log",
		"Create a work log for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			duration: z.number().int().optional(),
			description: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, ...rest } = args;
			return toolResult(() =>
				createWorkLog(
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
		"update_work_log",
		"Update a work log for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			work_log_id: z.string(),
			duration: z.number().int().optional(),
			description: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, work_log_id, ...rest } = args;
			return toolResult(() =>
				updateWorkLog(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					work_item_id,
					work_log_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_work_log",
		"Delete a work log for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			work_log_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await deleteWorkLog(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					args.work_log_id,
				);
				return { ok: true };
			})(),
	);
}
