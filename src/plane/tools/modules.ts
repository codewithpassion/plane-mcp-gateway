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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerModuleTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_modules",
		"List all modules in a project.",
		{
			...pid,
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listModules(
							ctx.config,
							ctx.workspaceSlug,
							projectId,
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
			...pid,
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
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createModule(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_module",
		"Retrieve a module by ID.",
		{ ...pid, module_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveModule(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.module_id as string,
				),
			)(),
	);

	server.tool(
		"update_module",
		"Update a module by ID.",
		{
			...pid,
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
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				module_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, module_id, ...rest } = a;
			return toolResult(() =>
				updateModule(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					module_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_module",
		"Delete a module by ID.",
		{ ...pid, module_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteModule(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.module_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_archived_modules",
		"List archived modules in a project.",
		{
			...pid,
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listArchivedModules(
							ctx.config,
							ctx.workspaceSlug,
							projectId,
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
			...pid,
			module_id: z.string(),
			work_item_ids: z.array(z.string()),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await addWorkItemsToModule(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.module_id as string,
					args.work_item_ids as string[],
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"remove_work_item_from_module",
		"Remove a work item from a module.",
		{
			...pid,
			module_id: z.string(),
			work_item_id: z.string(),
		},
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await removeWorkItemFromModule(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.module_id as string,
					args.work_item_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"list_module_work_items",
		"List work items in a module.",
		{
			...pid,
			module_id: z.string(),
			cursor: z.string().optional(),
			per_page: z.number().int().min(1).max(100).optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				module_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, module_id, ...rest } = a;
			return toolResult(
				async () =>
					(
						await listModuleWorkItems(
							ctx.config,
							ctx.workspaceSlug,
							projectId,
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
		{ ...pid, module_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await archiveModule(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.module_id as string,
				);
				return { ok: true };
			})(),
	);

	server.tool(
		"unarchive_module",
		"Unarchive a module.",
		{ ...pid, module_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await unarchiveModule(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.module_id as string,
				);
				return { ok: true };
			})(),
	);
}
