import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createState,
	deleteState,
	listStates,
	retrieveState,
	updateState,
} from "../resources/states";
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerStateTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_states",
		"List all states in a project.",
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
						await listStates(
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
		"create_state",
		"Create a new state.",
		{
			...pid,
			name: z.string(),
			color: z.string(),
			description: z.string().optional(),
			sequence: z.number().optional(),
			group: z.string().optional(),
			is_triage: z.boolean().optional(),
			default: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createState(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_state",
		"Retrieve a state by ID.",
		{ ...pid, state_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveState(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.state_id as string,
				),
			)(),
	);

	server.tool(
		"update_state",
		"Update a state by ID.",
		{
			...pid,
			state_id: z.string(),
			name: z.string().optional(),
			color: z.string().optional(),
			description: z.string().optional(),
			sequence: z.number().optional(),
			group: z.string().optional(),
			is_triage: z.boolean().optional(),
			default: z.boolean().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				state_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, state_id, ...rest } = a;
			return toolResult(() =>
				updateState(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					state_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_state",
		"Delete a state by ID.",
		{ ...pid, state_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteState(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.state_id as string,
				);
				return { ok: true };
			})(),
	);
}
