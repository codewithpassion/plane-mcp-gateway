import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkItemRelation,
	listWorkItemRelations,
	removeWorkItemRelation,
} from "../resources/work_item_relations";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerWorkItemRelationTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_item_relations",
		"List relations for a work item.",
		{
			...pid,
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				listWorkItemRelations(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
				),
			)(),
	);

	server.tool(
		"create_work_item_relation",
		"Create relations for a work item.",
		{
			...pid,
			work_item_id: z.string(),
			relation_type: z.string(),
			issues: z.array(z.string()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await createWorkItemRelation(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					stripNullish({
						relation_type: args.relation_type as string,
						issues: args.issues as string[],
					}),
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_item_relation",
		"Remove a relation from a work item.",
		{
			...pid,
			work_item_id: z.string(),
			related_issue: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await removeWorkItemRelation(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
					stripNullish({ related_issue: args.related_issue as string }),
				);
				return { ok: true };
			})(),
	);
}
