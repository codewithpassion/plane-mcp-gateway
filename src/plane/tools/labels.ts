import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PlaneAppContext } from "../context";
import { labels } from "../resources/labels";
import { toolResult } from "./_helpers";

export function registerLabelTools(
	server: McpServer,
	ctx: PlaneAppContext,
): void {
	server.tool(
		"list_labels",
		"List all labels in a project.",
		{
			project_id: z.string().describe("UUID of the project"),
			params: z
				.record(z.unknown())
				.optional()
				.describe("Optional query parameters as a dictionary"),
		},
		async ({ project_id, params }) =>
			toolResult(async () => {
				const response = await labels.list(
					ctx.config,
					ctx.workspaceSlug,
					project_id,
					params ?? null,
				);
				return response.results;
			}),
	);

	server.tool(
		"create_label",
		"Create a new label.",
		{
			project_id: z.string().describe("UUID of the project"),
			name: z.string().describe("Label name"),
			color: z.string().optional().describe("Label color (hex color code)"),
			description: z.string().optional().describe("Label description"),
			parent: z
				.string()
				.optional()
				.describe("UUID of the parent label (for nested labels)"),
			sort_order: z.number().optional().describe("Sort order for the label"),
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
			parent,
			sort_order,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				labels.create(ctx.config, ctx.workspaceSlug, project_id, {
					name,
					color,
					description,
					parent,
					sort_order,
					external_source,
					external_id,
				}),
			),
	);

	server.tool(
		"retrieve_label",
		"Retrieve a label by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			label_id: z.string().describe("UUID of the label"),
		},
		async ({ project_id, label_id }) =>
			toolResult(() =>
				labels.retrieve(ctx.config, ctx.workspaceSlug, project_id, label_id),
			),
	);

	server.tool(
		"update_label",
		"Update a label by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			label_id: z.string().describe("UUID of the label"),
			name: z.string().optional().describe("Label name"),
			color: z.string().optional().describe("Label color (hex color code)"),
			description: z.string().optional().describe("Label description"),
			parent: z
				.string()
				.optional()
				.describe("UUID of the parent label (for nested labels)"),
			sort_order: z.number().optional().describe("Sort order for the label"),
			external_source: z
				.string()
				.optional()
				.describe("External system source name"),
			external_id: z.string().optional().describe("External system identifier"),
		},
		async ({
			project_id,
			label_id,
			name,
			color,
			description,
			parent,
			sort_order,
			external_source,
			external_id,
		}) =>
			toolResult(() =>
				labels.update(ctx.config, ctx.workspaceSlug, project_id, label_id, {
					name,
					color,
					description,
					parent,
					sort_order,
					external_source,
					external_id,
				}),
			),
	);

	server.tool(
		"delete_label",
		"Delete a label by ID.",
		{
			project_id: z.string().describe("UUID of the project"),
			label_id: z.string().describe("UUID of the label"),
		},
		async ({ project_id, label_id }) =>
			toolResult(() =>
				labels.delete(ctx.config, ctx.workspaceSlug, project_id, label_id),
			),
	);
}
