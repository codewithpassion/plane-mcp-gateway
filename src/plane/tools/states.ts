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
import { stripNullish, toolResult } from "./_helpers";

export function registerStateTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_states",
		"List all states in a project.",
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
						await listStates(
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
		"create_state",
		"Create a new state.",
		{
			project_id: z.string(),
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
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createState(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_state",
		"Retrieve a state by ID.",
		{ project_id: z.string(), state_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveState(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.state_id,
				),
			)(),
	);

	server.tool(
		"update_state",
		"Update a state by ID.",
		{
			project_id: z.string(),
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
		async (args) => {
			const { project_id, state_id, ...rest } = args;
			return toolResult(() =>
				updateState(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					state_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_state",
		"Delete a state by ID.",
		{ project_id: z.string(), state_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteState(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.state_id,
				);
				return { ok: true };
			})(),
	);
}
