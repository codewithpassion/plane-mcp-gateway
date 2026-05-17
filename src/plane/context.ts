import type { PlaneConfig } from "./client";
import { ConfigurationError } from "./errors";

export interface PlaneAppContext {
	config: PlaneConfig;
	workspaceSlug: string;
}

const cache = new WeakMap<object, PlaneAppContext>();

export function getPlaneContext(env: Env): PlaneAppContext {
	const cached = cache.get(env as unknown as object);
	if (cached) return cached;

	const apiKey = (env as unknown as Record<string, string | undefined>)
		.PLANE_API_KEY;
	const workspaceSlug = (env as unknown as Record<string, string | undefined>)
		.PLANE_WORKSPACE_SLUG;
	const baseUrl =
		(env as unknown as Record<string, string | undefined>)
			.PLANE_INTERNAL_BASE_URL ||
		(env as unknown as Record<string, string | undefined>).PLANE_BASE_URL ||
		"https://api.plane.so";

	if (!apiKey) {
		throw new ConfigurationError(
			"PLANE_API_KEY is required (set via wrangler secret or .env)",
		);
	}
	if (!workspaceSlug) {
		throw new ConfigurationError(
			"PLANE_WORKSPACE_SLUG is required (set via wrangler secret or .env)",
		);
	}

	const ctx: PlaneAppContext = {
		config: { baseUrl, apiKey },
		workspaceSlug,
	};
	cache.set(env as unknown as object, ctx);
	return ctx;
}
