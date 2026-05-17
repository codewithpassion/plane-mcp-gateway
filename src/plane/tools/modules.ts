import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import { modules } from "../resources/modules";
import type { ModuleStatusEnum } from "../types/common";
import type { CreateModuleBody, UpdateModuleBody } from "../types/modules";
import { toolResult } from "./_helpers";

const MODULE_STATUS_VALUES: ReadonlySet<ModuleStatusEnum> = new Set([
	"backlog",
	"planned",
	"in-progress",
	"paused",
	"completed",
	"cancelled",
]);

function validateStatus(status?: string): ModuleStatusEnum | undefined {
	if (status === undefined || status === null) return undefined;
	return MODULE_STATUS_VALUES.has(status as ModuleStatusEnum)
		? (status as ModuleStatusEnum)
		: undefined;
}

export function registerModuleTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_modules",
		"List all modules in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async (params) =>
			toolResult(async () => {
				const response = await modules.list(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"create_module",
		"Create a new module.",
		{
			project_id: z.string().describe("UUID of the project"),
			name: z.string().describe("Module name"),
			description: z.string().optional().describe("Module description"),
			start_date: z
				.string()
				.optional()
				.describe("Module start date (ISO 8601 format)"),
			target_date: z
				.string()
				.optional()
				.describe("Module target/end date (ISO 8601 format)"),
			status: z
				.string()
				.optional()
				.describe(
					"Module status (backlog, planned, in-progress, paused, completed, cancelled)",
				),
			lead: z
				.string()
				.optional()
				.describe("UUID of the user who leads the module"),
			members: z
				.array(z.string())
				.optional()
				.describe("List of user IDs who are members of the module"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async (params) =>
			toolResult(() => {
				const data: CreateModuleBody = {
					name: params.name,
					description: params.description,
					start_date: params.start_date,
					target_date: params.target_date,
					status: validateStatus(params.status),
					lead: params.lead,
					members: params.members,
					external_source: params.external_source,
					external_id: params.external_id,
				};
				return modules.create(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					data,
				);
			}),
	);

	server.tool(
		"retrieve_module",
		"Retrieve a module by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
		},
		async (params) =>
			toolResult(() =>
				modules.retrieve(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
				),
			),
	);

	server.tool(
		"update_module",
		"Update a module by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
			name: z.string().optional().describe("Module name"),
			description: z.string().optional().describe("Module description"),
			start_date: z
				.string()
				.optional()
				.describe("Module start date (ISO 8601 format)"),
			target_date: z
				.string()
				.optional()
				.describe("Module target/end date (ISO 8601 format)"),
			status: z
				.string()
				.optional()
				.describe(
					"Module status (backlog, planned, in-progress, paused, completed, cancelled)",
				),
			lead: z
				.string()
				.optional()
				.describe("UUID of the user who leads the module"),
			members: z
				.array(z.string())
				.optional()
				.describe("List of user IDs who are members of the module"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async (params) =>
			toolResult(() => {
				const data: UpdateModuleBody = {
					name: params.name,
					description: params.description,
					start_date: params.start_date,
					target_date: params.target_date,
					status: validateStatus(params.status),
					lead: params.lead,
					members: params.members,
					external_source: params.external_source,
					external_id: params.external_id,
				};
				return modules.update(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
					data,
				);
			}),
	);

	server.tool(
		"delete_module",
		"Delete a module by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
		},
		async (params) =>
			toolResult(() =>
				modules.delete(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
				),
			),
	);

	server.tool(
		"list_archived_modules",
		"List archived modules in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async (params) =>
			toolResult(async () => {
				const response = await modules.listArchived(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"add_work_items_to_module",
		"Add work items to a module.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
			work_item_ids: z
				.array(z.string())
				.describe("List of work item UUIDs to add to the module"),
		},
		async (params) =>
			toolResult(() =>
				modules.addWorkItems(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
					params.work_item_ids,
				),
			),
	);

	server.tool(
		"remove_work_item_from_module",
		"Remove a work item from a module.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
			work_item_id: z.string().describe("UUID of the work item to remove"),
		},
		async (params) =>
			toolResult(() =>
				modules.removeWorkItem(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
					params.work_item_id,
				),
			),
	);

	server.tool(
		"list_module_work_items",
		"List work items in a module.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async (params) =>
			toolResult(async () => {
				const response = await modules.listWorkItems(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
					params.params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"archive_module",
		"Archive a module.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
		},
		async (params) =>
			toolResult(() =>
				modules.archive(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
				),
			),
	);

	server.tool(
		"unarchive_module",
		"Unarchive a module.",
		{
			project_id: z.string().describe("UUID of the project"),
			module_id: z.string().describe("UUID of the module"),
		},
		async (params) =>
			toolResult(() =>
				modules.unarchive(
					ctx.config,
					ctx.workspaceSlug,
					params.project_id,
					params.module_id,
				),
			),
	);
}
