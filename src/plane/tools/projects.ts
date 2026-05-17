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
import { stripNullish, toolResult } from "./_helpers";

export function registerProjectTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
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
		async (args) =>
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
		async (args) =>
			toolResult(() =>
				createProject(ctx.config, ctx.workspaceSlug, stripNullish(args)),
			)(),
	);

	server.tool(
		"retrieve_project",
		"Retrieve a project by ID.",
		{ project_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveProject(ctx.config, ctx.workspaceSlug, args.project_id),
			)(),
	);

	server.tool(
		"update_project",
		"Update a project by ID.",
		{
			project_id: z.string(),
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
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				updateProject(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_project",
		"Delete a project by ID.",
		{ project_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteProject(ctx.config, ctx.workspaceSlug, args.project_id);
				return { ok: true };
			})(),
	);

	server.tool(
		"get_project_worklog_summary",
		"Get work log summary for a project.",
		{ project_id: z.string() },
		async (args) =>
			toolResult(() =>
				getProjectWorklogSummary(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
				),
			)(),
	);

	server.tool(
		"get_project_members",
		"Get all members of a project.",
		{ project_id: z.string() },
		async (args) =>
			toolResult(() =>
				getProjectMembers(ctx.config, ctx.workspaceSlug, args.project_id),
			)(),
	);

	server.tool(
		"get_project_features",
		"Get features of a project.",
		{ project_id: z.string() },
		async (args) =>
			toolResult(() =>
				getProjectFeatures(ctx.config, ctx.workspaceSlug, args.project_id),
			)(),
	);

	server.tool(
		"update_project_features",
		"Update features of a project.",
		{
			project_id: z.string(),
			epics: z.boolean().optional(),
			modules: z.boolean().optional(),
			cycles: z.boolean().optional(),
			views: z.boolean().optional(),
			pages: z.boolean().optional(),
			intakes: z.boolean().optional(),
			work_item_types: z.boolean().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				updateProjectFeatures(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);
}
