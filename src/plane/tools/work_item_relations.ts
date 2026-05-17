import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createWorkItemRelation,
	listWorkItemRelations,
	removeWorkItemRelation,
} from "../resources/work_item_relations";
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkItemRelationTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_item_relations",
		"List relations for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(() =>
				listWorkItemRelations(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
				),
			)(),
	);

	server.tool(
		"create_work_item_relation",
		"Create relations for a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			relation_type: z.string(),
			issues: z.array(z.string()),
		},
		async (args) =>
			toolResult(async () => {
				await createWorkItemRelation(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					stripNullish({
						relation_type: args.relation_type,
						issues: args.issues,
					}),
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_item_relation",
		"Remove a relation from a work item.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			related_issue: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await removeWorkItemRelation(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
					stripNullish({ related_issue: args.related_issue }),
				);
				return { ok: true };
			})(),
	);
}
