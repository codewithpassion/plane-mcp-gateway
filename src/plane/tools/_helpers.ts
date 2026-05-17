import { z } from "zod";
import type { PlaneAppContext } from "../client";
import { ConfigurationError } from "../errors";

export type ToolHandlerResult = {
	content: { type: "text"; text: string }[];
	isError?: boolean;
};

export function stripNullish<T extends Record<string, unknown>>(
	obj: T,
): Partial<T> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(obj)) {
		if (v === undefined || v === null) continue;
		out[k] = v;
	}
	return out as Partial<T>;
}

export function toolResult(
	fn: () => Promise<unknown> | unknown,
): () => Promise<ToolHandlerResult> {
	return async () => {
		try {
			const value = await fn();
			const text =
				value === undefined || value === null
					? ""
					: typeof value === "string"
						? value
						: JSON.stringify(value, null, 2);
			return { content: [{ type: "text", text }] };
		} catch (err) {
			const message =
				err instanceof Error ? `${err.name}: ${err.message}` : String(err);
			return {
				content: [{ type: "text", text: message }],
				isError: true,
			};
		}
	};
}

/**
 * Returns the `project_id` schema fragment for tools that need it.
 * When the config is pinned to a project, returns `{}` so the
 * parameter disappears from the tool schema entirely.
 */
export function projectIdField(
	ctx: PlaneAppContext,
): { project_id: z.ZodString } | Record<string, never> {
	if (ctx.projectId) return {};
	return { project_id: z.string() };
}

export function requireProjectId(
	ctx: PlaneAppContext,
	params: { project_id?: string },
): string {
	const id = ctx.projectId ?? params.project_id;
	if (!id) {
		throw new ConfigurationError("project_id is required");
	}
	return id;
}

export function isProjectPinned(ctx: PlaneAppContext): boolean {
	return Boolean(ctx.projectId);
}
