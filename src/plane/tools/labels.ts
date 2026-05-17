import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../client";
import {
	createLabel,
	deleteLabel,
	listLabels,
	retrieveLabel,
	updateLabel,
} from "../resources/labels";
import { stripNullish, toolResult } from "./_helpers";

export function registerLabelTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_labels",
		"List all labels in a project.",
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
						await listLabels(
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
		"create_label",
		"Create a new label.",
		{
			project_id: z.string(),
			name: z.string(),
			color: z.string().optional(),
			description: z.string().optional(),
			parent: z.string().optional(),
			sort_order: z.number().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, ...rest } = args;
			return toolResult(() =>
				createLabel(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_label",
		"Retrieve a label by ID.",
		{ project_id: z.string(), label_id: z.string() },
		async (args) =>
			toolResult(() =>
				retrieveLabel(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.label_id,
				),
			)(),
	);

	server.tool(
		"update_label",
		"Update a label by ID.",
		{
			project_id: z.string(),
			label_id: z.string(),
			name: z.string().optional(),
			color: z.string().optional(),
			description: z.string().optional(),
			parent: z.string().optional(),
			sort_order: z.number().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args) => {
			const { project_id, label_id, ...rest } = args;
			return toolResult(() =>
				updateLabel(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					label_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_label",
		"Delete a label by ID.",
		{ project_id: z.string(), label_id: z.string() },
		async (args) =>
			toolResult(async () => {
				await deleteLabel(
					ctx.config,
					ctx.workspaceSlug,
					args.project_id,
					args.label_id,
				);
				return { ok: true };
			})(),
	);
}
