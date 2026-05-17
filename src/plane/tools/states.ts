import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import { states } from "../resources/states";
import type { StateGroupEnum } from "../types/common";
import { toolResult } from "./_helpers";

const STATE_GROUPS: readonly StateGroupEnum[] = [
	"backlog",
	"unstarted",
	"started",
	"completed",
	"cancelled",
	"triage",
];

function validateGroup(group: string | undefined): StateGroupEnum | undefined {
	if (group && (STATE_GROUPS as readonly string[]).includes(group)) {
		return group as StateGroupEnum;
	}
	return undefined;
}

export function registerStateTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_states",
		"List all states in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async ({ project_id, params }) =>
			toolResult(async () => {
				const response = await states.list(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"create_state",
		"Create a new state.",
		{
			project_id: z.string().describe("UUID of the project"),
			name: z.string().describe("State name"),
			color: z.string().describe("State color (hex color code)"),
			description: z.string().optional().describe("State description"),
			sequence: z.number().optional().describe("State sequence order"),
			group: z
				.string()
				.optional()
				.describe(
					"State group (e.g., backlog, unstarted, started, completed, cancelled)",
				),
			is_triage: z
				.boolean()
				.optional()
				.describe("Whether this is a triage state"),
			default: z
				.boolean()
				.optional()
				.describe("Whether this is the default state"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async ({
			project_id,
			name,
			color,
			description,
			sequence,
			group,
			is_triage,
			default: isDefault,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				states.create(ctx.config, ctx.workspaceSlug, project_id, {
					name,
					color,
					description,
					sequence,
					group: validateGroup(group),
					is_triage,
					default: isDefault,
					external_source,
					external_id,
				}),
			),
	);

	server.tool(
		"retrieve_state",
		"Retrieve a state by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			state_id: z.string().describe("UUID of the state"),
		},
		async ({ project_id, state_id }) =>
			toolResult(() =>
				states.retrieve(ctx.config, ctx.workspaceSlug, project_id, state_id),
			),
	);

	server.tool(
		"update_state",
		"Update a state by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			state_id: z.string().describe("UUID of the state"),
			name: z.string().optional().describe("State name"),
			color: z.string().optional().describe("State color (hex color code)"),
			description: z.string().optional().describe("State description"),
			sequence: z.number().optional().describe("State sequence order"),
			group: z
				.string()
				.optional()
				.describe(
					"State group (e.g., backlog, unstarted, started, completed, cancelled)",
				),
			is_triage: z
				.boolean()
				.optional()
				.describe("Whether this is a triage state"),
			default: z
				.boolean()
				.optional()
				.describe("Whether this is the default state"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async ({
			project_id,
			state_id,
			name,
			color,
			description,
			sequence,
			group,
			is_triage,
			default: isDefault,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				states.update(ctx.config, ctx.workspaceSlug, project_id, state_id, {
					name,
					color,
					description,
					sequence,
					group: validateGroup(group),
					is_triage,
					default: isDefault,
					external_source,
					external_id,
				}),
			),
	);

	server.tool(
		"delete_state",
		"Delete a state by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			state_id: z.string().describe("UUID of the state"),
		},
		async ({ project_id, state_id }) =>
			toolResult(() =>
				states.delete(ctx.config, ctx.workspaceSlug, project_id, state_id),
			),
	);
}
