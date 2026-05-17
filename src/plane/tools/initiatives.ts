import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createInitiative,
	deleteInitiative,
	listInitiatives,
	retrieveInitiative,
	updateInitiative,
} from "../resources/initiatives";
import { stripNullish, toolResult } from "./_helpers";

export function registerInitiativeTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_initiatives",
		"List all initiatives in a workspace.",
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
						await listInitiatives(
							ctx.config,
							ctx.workspaceSlug,
							stripNullish(args),
						)
					).results,
			)(),
	);

	server.tool(
		"create_initiative",
		"Create a new initiative in the workspace.",
		{
			name: z.string(),
			description_html: z.string().optional(),
			start_date: z.string().optional(),
			end_date: z.string().optional(),
			logo_props: z.record(z.unknown()).optional(),
			state: z.string().optional(),
			lead: z.string().optional(),
		},
		async (args) =>
			toolResult(() =>
				createInitiative(ctx.config, ctx.workspaceSlug, stripNullish(args)),
			)(),
	);

	server.tool(
		"retrieve_initiative",
		"Retrieve an initiative by ID.",
		{ initiative_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveInitiative(ctx.config, ctx.workspaceSlug, args.initiative_id),
			)(),
	);

	server.tool(
		"update_initiative",
		"Update an initiative by ID.",
		{
			initiative_id: z.string(),
			name: z.string().optional(),
			description_html: z.string().optional(),
			start_date: z.string().optional(),
			end_date: z.string().optional(),
			logo_props: z.record(z.unknown()).optional(),
			state: z.string().optional(),
			lead: z.string().optional(),
		},
		async (args) => {
			const { initiative_id, ...rest } = args;
			return toolResult(() =>
				updateInitiative(
					ctx.config,
					ctx.workspaceSlug,
					initiative_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_initiative",
		"Delete an initiative by ID.",
		{ initiative_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteInitiative(
					ctx.config,
					ctx.workspaceSlug,
					args.initiative_id,
				);
				return { ok: true };
			})(),
	);
}
