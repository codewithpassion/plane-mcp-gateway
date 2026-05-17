import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	getWorkspaceFeatures,
	getWorkspaceMembers,
	updateWorkspaceFeatures,
} from "../resources/workspaces";
import { stripNullish, toolResult } from "./_helpers";

export function registerWorkspaceTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"get_workspace_members",
		"Get all members of the current workspace.",
		{},
		async () =>
			toolResult(() => getWorkspaceMembers(ctx.config, ctx.workspaceSlug))(),
	);

	server.tool(
		"get_workspace_features",
		"Get features of the current workspace.",
		{},
		async () =>
			toolResult(() => getWorkspaceFeatures(ctx.config, ctx.workspaceSlug))(),
	);

	server.tool(
		"update_workspace_features",
		"Update features of the current workspace.",
		{
			project_grouping: z.boolean().optional(),
			initiatives: z.boolean().optional(),
			teams: z.boolean().optional(),
			customers: z.boolean().optional(),
			wiki: z.boolean().optional(),
			pi: z.boolean().optional(),
		},
		async (args) =>
			toolResult(() =>
				updateWorkspaceFeatures(
					ctx.config,
					ctx.workspaceSlug,
					stripNullish(args),
				),
			)(),
	);
}
