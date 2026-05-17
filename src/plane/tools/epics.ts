import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext, PlaneConfig } from "../client";
import {
	createWorkItem,
	deleteWorkItem,
	listEpics,
	listWorkItemTypes,
	retrieveEpic,
	updateWorkItem,
} from "../resources/epics";
import type { WorkItem, WorkItemType } from "../types/epics";
import { stripNullish, toolResult } from "./_helpers";

async function getEpicWorkItemType(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
): Promise<WorkItemType | null> {
	const types = await listWorkItemTypes(cfg, workspaceSlug, projectId);
	for (const t of types) {
		if (t.is_epic) return t;
	}
	return null;
}

export function registerEpicTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_epics",
		"List all epics in a project.",
		{
			project_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listEpics(
							ctx.config,
							ctx.workspaceSlug,
							project_id,
							stripNullish(rest),
						)
					).results,
			)();
		},
	);

	server.tool(
		"create_epic",
		"Create a new epic.",
		{
			project_id: z.string(),
			name: z.string(),
			assignees: z.array(z.string()).optional(),
			labels: z.array(z.string()).optional(),
			point: z.number().int().optional(),
			description_html: z.string().optional(),
			description_stripped: z.string().optional(),
			priority: z.string().optional(),
			start_date: z.string().optional(),
			target_date: z.string().optional(),
			sort_order: z.number().optional(),
			is_draft: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			parent: z.string().optional(),
			state: z.string().optional(),
			estimate_point: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(async () => {
				const epicType = await getEpicWorkItemType(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
				);
				if (!epicType) {
					throw new Error(
						"No work item type with is_epic=True found in the project",
					);
				}
				const body = stripNullish({ ...rest, type_id: epicType.id as string });
				const workItem: WorkItem = await createWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					body,
				);
				return retrieveEpic(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					workItem.id as string,
				);
			})();
		},
	);

	server.tool(
		"update_epic",
		"Update an epic by ID.",
		{
			project_id: z.string(),
			epic_id: z.string(),
			name: z.string().optional(),
			assignees: z.array(z.string()).optional(),
			labels: z.array(z.string()).optional(),
			point: z.number().int().optional(),
			description_html: z.string().optional(),
			description_stripped: z.string().optional(),
			priority: z.string().optional(),
			start_date: z.string().optional(),
			target_date: z.string().optional(),
			sort_order: z.number().optional(),
			is_draft: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			state: z.string().optional(),
			estimate_point: z.string().optional(),
		},
		async (args) => {
			const { project_id, epic_id, ...rest } = args;
			return toolResult(async () => {
				const workItem: WorkItem = await updateWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					epic_id,
					stripNullish(rest),
				);
				return retrieveEpic(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					workItem.id as string,
				);
			})();
		},
	);

	server.tool(
		"retrieve_epic",
		"Retrieve an epic by ID.",
		{ project_id: z.string(), epic_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveEpic(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.epic_id,
				),
			)(),
	);

	server.tool(
		"delete_epic",
		"Delete an epic by ID.",
		{ project_id: z.string(), epic_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.epic_id,
				);
				return { ok: true };
			})(),
	);
}
