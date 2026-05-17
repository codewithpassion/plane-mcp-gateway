import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	advancedSearchWorkItems,
	createWorkItem,
	deleteWorkItem,
	listWorkItems,
	retrieveWorkItem,
	retrieveWorkItemByIdentifier,
	searchWorkItems,
	updateWorkItem,
} from "../resources/work_items";
import { stripNullish, toolResult } from "./_helpers";

type Condition = Record<string, unknown>;

function buildAdvancedSearchFilters(args: {
	assignee_ids?: string[];
	state_ids?: string[];
	state_groups?: string[];
	priorities?: string[];
	label_ids?: string[];
	type_ids?: string[];
	cycle_ids?: string[];
	module_ids?: string[];
	is_archived?: boolean;
	created_by_ids?: string[];
}): Record<string, unknown> | undefined {
	const conditions: Condition[] = [];
	if (args.assignee_ids?.length)
		conditions.push({ assignee_id__in: args.assignee_ids });
	if (args.state_ids?.length) conditions.push({ state_id__in: args.state_ids });
	if (args.state_groups?.length)
		conditions.push({ state_group__in: args.state_groups });
	if (args.priorities?.length)
		conditions.push({ priority__in: args.priorities });
	if (args.label_ids?.length) conditions.push({ label_id__in: args.label_ids });
	if (args.type_ids?.length) conditions.push({ type_id__in: args.type_ids });
	if (args.cycle_ids?.length) conditions.push({ cycle_id__in: args.cycle_ids });
	if (args.module_ids?.length)
		conditions.push({ module_id__in: args.module_ids });
	if (args.is_archived !== undefined && args.is_archived !== null)
		conditions.push({ is_archived: args.is_archived });
	if (args.created_by_ids?.length)
		conditions.push({ created_by_id__in: args.created_by_ids });
	if (conditions.length === 0) return undefined;
	if (conditions.length === 1) return conditions[0];
	return { and: conditions };
}

export function registerWorkItemTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_work_items",
		"List work items in a project or search across the workspace. When any filter parameter is provided (assignee_ids, state_ids, state_groups, priorities, label_ids, type_ids, cycle_ids, module_ids, is_archived, created_by_ids, or query), this uses the advanced search endpoint which supports powerful filtering. Otherwise it uses the standard list endpoint.",
		{
			project_id: z.string().optional(),
			query: z.string().optional(),
			assignee_ids: z.array(z.string()).optional(),
			state_ids: z.array(z.string()).optional(),
			state_groups: z.array(z.string()).optional(),
			priorities: z.array(z.string()).optional(),
			label_ids: z.array(z.string()).optional(),
			type_ids: z.array(z.string()).optional(),
			cycle_ids: z.array(z.string()).optional(),
			module_ids: z.array(z.string()).optional(),
			is_archived: z.boolean().optional(),
			created_by_ids: z.array(z.string()).optional(),
			workspace_search: z.boolean().optional(),
			limit: z.number().int().optional(),
			cursor: z.string().optional(),
			per_page: z.number().int().optional(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			order_by: z.string().optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
		},
		async (args) =>
			toolResult(async () => {
				const filters = buildAdvancedSearchFilters(args);
				if (filters !== undefined || args.query !== undefined) {
					const body = stripNullish({
						query: args.query,
						filters,
						limit: args.limit,
						project_id: args.project_id,
						workspace_search: args.workspace_search ? true : undefined,
					});
					return advancedSearchWorkItems(
						ctx.config,
						ctx.workspaceSlug,
						body as Record<string, unknown>,
					);
				}
				if (!args.project_id) {
					throw new Error(
						"project_id is required when no filters are provided",
					);
				}
				const params = stripNullish({
					cursor: args.cursor,
					per_page: args.per_page,
					expand: args.expand,
					fields: args.fields,
					order_by: args.order_by,
					external_id: args.external_id,
					external_source: args.external_source,
				});
				const res = await listWorkItems(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					params,
				);
				return res.results;
			})(),
	);

	server.tool(
		"create_work_item",
		"Create a new work item.",
		{
			project_id: z.string(),
			name: z.string(),
			assignees: z.array(z.string()).optional(),
			labels: z.array(z.string()).optional(),
			type_id: z.string().optional(),
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
			type: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_work_item",
		"Retrieve a work item by ID.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, ...rest } = args;
			return toolResult(() =>
				retrieveWorkItem(
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
		"retrieve_work_item_by_identifier",
		"Retrieve a work item by project identifier and issue sequence number.",
		{
			project_identifier: z.string(),
			issue_identifier: z.number().int(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args) => {
			const { project_identifier, issue_identifier, ...rest } = args;
			return toolResult(() =>
				retrieveWorkItemByIdentifier(
					ctx.config,
					ctx.workspaceSlug,
					project_identifier,
					issue_identifier,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"update_work_item",
		"Update a work item by ID.",
		{
			project_id: z.string(),
			work_item_id: z.string(),
			name: z.string().optional(),
			assignees: z.array(z.string()).optional(),
			labels: z.array(z.string()).optional(),
			type_id: z.string().optional(),
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
			type: z.string().optional(),
		},
		async (args) => {
			const { project_id, work_item_id, ...rest } = args;
			return toolResult(() =>
				updateWorkItem(
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
		"delete_work_item",
		"Delete a work item by ID.",
		{ project_id: z.string(), work_item_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.work_item_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"search_work_items",
		"Search work items across a workspace.",
		{
			query: z.string(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args) => {
			const params = stripNullish({
				q: args.query,
				expand: args.expand,
				fields: args.fields,
				external_id: args.external_id,
				external_source: args.external_source,
				order_by: args.order_by,
			});
			return toolResult(() =>
				searchWorkItems(ctx.config, ctx.workspaceSlug, params),
			)();
		},
	);
}
