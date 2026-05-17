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
import {
	projectIdField,
	requireProjectId,
	stripNullish,
	toolResult,
} from "./_helpers";

export function registerLabelTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	const pid = projectIdField(ctx);

	server.tool(
		"list_labels",
		"List all labels in a project.",
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
						await listLabels(
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
		"create_label",
		"Create a new label.",
		{
			...pid,
			name: z.string(),
			color: z.string().optional(),
			description: z.string().optional(),
			parent: z.string().optional(),
			sort_order: z.number().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as { project_id?: string } & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, ...rest } = a;
			return toolResult(() =>
				createLabel(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"retrieve_label",
		"Retrieve a label by ID.",
		{ ...pid, label_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(() =>
				retrieveLabel(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.label_id as string,
				),
			)(),
	);

	server.tool(
		"update_label",
		"Update a label by ID.",
		{
			...pid,
			label_id: z.string(),
			name: z.string().optional(),
			color: z.string().optional(),
			description: z.string().optional(),
			parent: z.string().optional(),
			sort_order: z.number().optional(),
			external_source: z.string().optional(),
			external_id: z.string().optional(),
		},
		async (args: Record<string, unknown>) => {
			const a = args as {
				project_id?: string;
				label_id: string;
			} & Record<string, unknown>;
			const projectId = requireProjectId(ctx, a);
			const { project_id: _drop, label_id, ...rest } = a;
			return toolResult(() =>
				updateLabel(
					ctx.config,
					ctx.workspaceSlug,
					projectId,
					label_id,
					stripNullish(rest),
				),
			)();
		},
	);

	server.tool(
		"delete_label",
		"Delete a label by ID.",
		{ ...pid, label_id: z.string() },
		async (args: Record<string, unknown>) =>
			toolResult(async () => {
				await deleteLabel(
					ctx.config,
					ctx.workspaceSlug,
					requireProjectId(ctx, args as { project_id?: string }),
					args.label_id as string,
				);
				return { ok: true };
			})(),
	);
}
