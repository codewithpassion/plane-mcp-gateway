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

export function projectIdField(_ctx: PlaneAppContext) {
	return {} as Record<string, never>;
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
