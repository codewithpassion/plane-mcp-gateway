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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";
import { withWebUrl } from "./_web_url";

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
	const pid = projectIdField(ctx);

	server.tool(
		"list_work_items",
		"List work items in a project or search across the workspace. When any filter parameter is provided (assignee_ids, state_ids, state_groups, priorities, label_ids, type_ids, cycle_ids, module_ids, is_archived, created_by_ids, or query), this uses the advanced search endpoint which supports powerful filtering. Otherwise it uses the standard list endpoint.",
		{
			...pid,
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
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				const a = args as {
					project_id?: string;
					query?: string;
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
					workspace_search?: boolean;
					limit?: number;
					cursor?: string;
					per_page?: number;
					expand?: string;
					fields?: string;
					order_by?: string;
					external_id?: string;
					external_source?: string;
				};
				const resolvedPid = ctx.projectId ?? a.project_id;
				const filters = buildAdvancedSearchFilters(a);
				if (filters !== undefined || a.query !== undefined) {
					const body = stripNullish({
						query: a.query,
						filters,
						limit: a.limit,
						project_id: resolvedPid,
						workspace_search: a.workspace_search ? true : undefined,
					});
					return withWebUrl(
						ctx,
						"work_item",
						await advancedSearchWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							body as Record<string, unknown>,
						),
						resolvedPid,
					);
				}
				if (!resolvedPid) {
					throw new Error(
						"project_id is required when no filters are provided",
					);
				}
				const params = stripNullish({
					cursor: a.cursor,
					per_page: a.per_page,
					expand: a.expand,
					fields: a.fields,
					order_by: a.order_by,
					external_id: a.external_id,
					external_source: a.external_source,
				});
				const res = await listWorkItems(
					ctx.config,
					ctx.workspaceSlug,
					resolvedPid,
					params,
				);
				return withWebUrl(ctx, "work_item", res.results, resolvedPid);
			})(),
	);

	server.tool(
		"create_work_item",
		"Create a new work item.",
		{
			...pid,
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
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(async () =>
				withWebUrl(
					ctx,
					"work_item",
					await createWorkItem(
						ctx.config,
						ctx.workspaceSlug,
						projectId,
						stripNullish(rest),
					),
					projectId,
				),
			)();
		},
	);

	server.tool(
		"retrieve_work_item",
		"Retrieve a work item by ID.",
		{
			...pid,
			work_item_id: z.string(),
			expand: z.string().optional(),
			fields: z.string().optional(),
			external_id: z.string().optional(),
			external_source: z.string().optional(),
			order_by: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, ...rest } = a;
			return toolResult(async () =>
				withWebUrl(
					ctx,
					"work_item",
					await retrieveWorkItem(
						ctx.config,
						ctx.workspaceSlug,
						projectId,
						work_item_id,
						stripNullish(rest),
					),
					projectId,
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
			return toolResult(async () =>
				withWebUrl(
					ctx,
					"work_item",
					await retrieveWorkItemByIdentifier(
						ctx.config,
						ctx.workspaceSlug,
						project_identifier,
						issue_identifier,
						stripNullish(rest),
					),
				),
			)();
		},
	);

	server.tool(
		"update_work_item",
		"Update a work item by ID.",
		{
			...pid,
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
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				work_item_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, work_item_id, ...rest } = a;
			return toolResult(async () =>
				withWebUrl(
					ctx,
					"work_item",
					await updateWorkItem(
						ctx.config,
						ctx.workspaceSlug,
						projectId,
						work_item_id,
						stripNullish(rest),
					),
					projectId,
				),
			)();
		},
	);

	server.tool(
		"delete_work_item",
		"Delete a work item by ID.",
		{ ...pid, work_item_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.work_item_id as string,
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
			return toolResult(async () =>
				withWebUrl(
					ctx,
					"work_item",
					await searchWorkItems(ctx.config, ctx.workspaceSlug, params),
				),
			)();
		},
	);
}
