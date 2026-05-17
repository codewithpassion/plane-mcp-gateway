import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createProject,
	deleteProject,
	getProjectFeatures,
	getProjectMembers,
	getProjectWorklogSummary,
	listProjects,
	retrieveProject,
	updateProject,
	updateProjectFeatures,
} from "../resources/projects";
import {
	isProjectPinned,
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerProjectTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pinned = isProjectPinned(ctx);
	const pid = projectIdField(ctx);

	if (!pinned) {
		server.tool(
			"list_projects",
			"List all projects in the workspace.",
			{
				cursor: z.string().optional(),
				per_page: z.number().int().min(1).max(100).optional(),
				expand: z.string().optional(),
				fields: z.string().optional(),
				order_by: z.string().optional(),
			},
			async (args: Record<string, unknown>) =>
				toolResult(
					async () =>
						(
							await listProjects(
								ctx.config,
								ctx.workspaceSlug,
								stripNullish(args),
							)
						).results,
				)(),
		);

		server.tool(
			"create_project",
			"Create a new project in the workspace.",
			{
				name: z.string(),
				identifier: z.string(),
				description: z.string().optional(),
				project_lead: z.string().optional(),
				default_assignee: z.string().optional(),
				emoji: z.string().optional(),
				cover_image: z.string().optional(),
				module_view: z.boolean().optional(),
				cycle_view: z.boolean().optional(),
				issue_views_view: z.boolean().optional(),
				page_view: z.boolean().optional(),
				intake_view: z.boolean().optional(),
				guest_view_all_features: z.boolean().optional(),
				archive_in: z.number().int().optional(),
				close_in: z.number().int().optional(),
				timezone: z.string().optional(),
				external_source: z.string().optional(),
				external_id: z.string().optional(),
				is_issue_type_enabled: z.boolean().optional(),
			},
			async (args: Record<string, unknown>) =>
				toolResult(() =>
					createProject(ctx.config, ctx.workspaceSlug, stripNullish(args)),
				)(),
		);

		server.tool(
			"delete_project",
			"Delete a project by ID.",
			{ project_id: z.string() },
			async (args: Record<string, unknown>) =>
				toolResult(async () => {
					await deleteProject(
						ctx.config,
						ctx.workspaceSlug,
						args.project_id as string,
					);
					return { ok: true };
				})(),
		);
	}

	server.tool(
		"retrieve_project",
		"Retrieve a project by ID.",
		{ ...pid },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveProject(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
				),
			)(),
	);

	server.tool(
		"update_project",
		"Update a project by ID.",
		{
			...pid,
			name: z.string().optional(),
			description: z.string().optional(),
			project_lead: z.string().optional(),
			default_assignee: z.string().optional(),
			identifier: z.string().optional(),
			emoji: z.string().optional(),
			cover_image: z.string().optional(),
			module_view: z.boolean().optional(),
			cycle_view: z.boolean().optional(),
			issue_views_view: z.boolean().optional(),
			page_view: z.boolean().optional(),
			intake_view: z.boolean().optional(),
			guest_view_all_features: z.boolean().optional(),
			archive_in: z.number().int().optional(),
			close_in: z.number().int().optional(),
			timezone: z.string().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
			is_issue_type_enabled: z.boolean().optional(),
			is_time_tracking_enabled: z.boolean().optional(),
			default_state: z.string().optional(),
			estimate: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				updateProject(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"get_project_worklog_summary",
		"Get work log summary for a project.",
		{ ...pid },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				getProjectWorklogSummary(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
				),
			)(),
	);

	server.tool(
		"get_project_members",
		"Get all members of a project.",
		{ ...pid },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				getProjectMembers(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
				),
			)(),
	);

	server.tool(
		"get_project_features",
		"Get features of a project.",
		{ ...pid },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				getProjectFeatures(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
				),
			)(),
	);

	server.tool(
		"update_project_features",
		"Update features of a project.",
		{
			...pid,
			epics: z.boolean().optional(),
			modules: z.boolean().optional(),
			cycles: z.boolean().optional(),
			views: z.boolean().optional(),
			pages: z.boolean().optional(),
			intakes: z.boolean().optional(),
			work_item_types: z.boolean().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				updateProjectFeatures(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);
}
