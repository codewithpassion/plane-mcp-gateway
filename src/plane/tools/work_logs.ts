import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkLog,
	deleteWorkLog,
	listWorkLogs,
	updateWorkLog,
} from "../resources/work_logs";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerWorkLogTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_logs",
		"List work logs for a work item.",
		{ ...pid, work_item_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				listWorkLogs(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
				),
			)(),
	);

	server.tool(
		"create_work_log",
		"Create a work log for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			duration: z.number().int().optional(),
			description: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, ...rest } = a;
			return toolResult(() =>
				createWorkLog(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
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
			...pid,
			work_item_id: z.string(),
			work_log_id: z.string(),
			duration: z.number().int().optional(),
			description: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
				work_log_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, work_log_id, ...rest } = a;
			return toolResult(() =>
				updateWorkLog(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
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
			...pid,
			work_item_id: z.string(),
			work_log_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteWorkLog(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					args.work_log_id as string,
				);
				return { ok: true };
			})(),
	);
}
