import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	addWorkItemsToModule,
	archiveModule,
	createModule,
	deleteModule,
	listArchivedModules,
	listModules,
	listModuleWorkItems,
	removeWorkItemFromModule,
	retrieveModule,
	unarchiveModule,
	updateModule,
} from "../resources/modules";
import { stripNullish, toolResult } from "./_helpers";

export function registerModuleTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_modules",
		"List all modules in a project.",
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
						await listModules(
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
		"create_module",
		"Create a new module.",
		{
			project_id: z.string(),
			name: z.string(),
			description: z.string().optional(),
			start_date: z.string().optional(),
			target_date: z.string().optional(),
			status: z.string().optional(),
			lead: z.string().optional(),
			members: z.array(z.string()).optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createModule(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_module",
		"Retrieve a module by ID.",
		{ project_id: z.string(), module_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveModule(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.module_id,
				),
			)(),
	);

	server.tool(
		"update_module",
		"Update a module by ID.",
		{
			project_id: z.string(),
			module_id: z.string(),
			name: z.string().optional(),
			description: z.string().optional(),
			start_date: z.string().optional(),
			target_date: z.string().optional(),
			status: z.string().optional(),
			lead: z.string().optional(),
			members: z.array(z.string()).optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, module_id, ...rest } = args;
			return toolResult(() =>
				updateModule(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					module_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_module",
		"Delete a module by ID.",
		{ project_id: z.string(), module_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteModule(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.module_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_archived_modules",
		"List archived modules in a project.",
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
						await listArchivedModules(
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
		"add_work_items_to_module",
		"Add work items to a module.",
		{
			project_id: z.string(),
			module_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args) =>
			toolResult(async () => {
				await addWorkItemsToModule(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.module_id,
					args.work_item_ids,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_item_from_module",
		"Remove a work item from a module.",
		{
			project_id: z.string(),
			module_id: z.string(),
			work_item_id: z.string(),
		},
		async (args) =>
			toolResult(async () => {
				await removeWorkItemFromModule(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.module_id,
					args.work_item_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_module_work_items",
		"List work items in a module.",
		{
			project_id: z.string(),
			module_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args) => {
			const { project_id, module_id, ...rest } = args;
			return toolResult(
				async () =>
					(
						await listModuleWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							project_id,
							module_id,
							stripNullish(rest),
						)
					).results,
			)();
		},
	);

	server.tool(
		"archive_module",
		"Archive a module.",
		{ project_id: z.string(), module_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await archiveModule(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.module_id,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"unarchive_module",
		"Unarchive a module.",
		{ project_id: z.string(), module_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await unarchiveModule(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.module_id,
				);
				return { ok: true };
			})(),
	);
}
