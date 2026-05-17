import type { PlaneAppContext } from "../client";

export type WebUrlKind = "project" | "work_item" | "cycle" | "module" | "page";

function workspaceUrl(ctx: PlaneAppContext): string {
	return `${ctx.config.baseUrl.replace(/\/+$/, "")}/${ctx.workspaceSlug}`;
}

function getString(obj: unknown, ...keys: string[]): string | undefined {
	if (!obj || typeof obj !== "object") return undefined;
	const o = obj as Record<string, unknown>;
	for (const k of keys) {
		const v = o[k];
		if (typeof v === "string" && v.length > 0) return v;
	}
	return undefined;
}

function buildOne(
	ctx: PlaneAppContext,
	kind: WebUrlKind,
	item: Record<string, unknown>,
	defaultProjectId?: string,
): string | undefined {
	const ws = workspaceUrl(ctx);
	const id = getString(item, "id");
	if (!id) return undefined;
	if (kind === "project") {
		return `${ws}/projects/${id}/`;
	}
	const projectId =
		getString(item, "project", "project_id") ?? defaultProjectId;
	if (!projectId) return undefined;
	switch (kind) {
		case "work_item":
			return `${ws}/projects/${projectId}/work-items/${id}/`;
		case "cycle":
			return `${ws}/projects/${projectId}/cycles/${id}/`;
		case "module":
			return `${ws}/projects/${projectId}/modules/${id}/`;
		case "page":
			return `${ws}/projects/${projectId}/pages/${id}/`;
	}
}

function injectOne(
	ctx: PlaneAppContext,
	kind: WebUrlKind,
	item: unknown,
	defaultProjectId?: string,
): unknown {
	if (!item || typeof item !== "object") return item;
	const obj = item as Record<string, unknown>;
	const url = buildOne(ctx, kind, obj, defaultProjectId);
	return url ? { ...obj, web_url: url } : obj;
}

/**
 * Attach a `web_url` field to a tool result.
 * Handles: single objects, plain arrays, and paginated responses
 * (`{ results: [...] }`). Falls back to returning the value unchanged
 * if no id is present.
 */
export function withWebUrl<T>(
	ctx: PlaneAppContext,
	kind: WebUrlKind,
	value: T,
	defaultProjectId?: string,
): T {
	if (Array.isArray(value)) {
		return value.map((v) =>
			injectOne(ctx, kind, v, defaultProjectId),
		) as unknown as T;
	}
	if (value && typeof value === "object" && "results" in value) {
		const v = value as { results?: unknown };
		if (Array.isArray(v.results)) {
			return {
				...(value as Record<string, unknown>),
				results: v.results.map((r) =>
					injectOne(ctx, kind, r, defaultProjectId),
				),
			} as unknown as T;
		}
	}
	return injectOne(ctx, kind, value, defaultProjectId) as T;
}
