import { createClerkClient } from "@clerk/backend";
import { Hono } from "hono";
import { z } from "zod";
import { planeFetch } from "../plane/client";
import {
	deleteConfig,
	listConfigs,
	loadConfig,
	type PlaneConfigRecord,
	redactApiKey,
	saveConfig,
	validateSlug,
} from "../plane/storage";

type Variables = { userId: string };

const apiApp = new Hono<{ Bindings: Env; Variables: Variables }>();

apiApp.use("*", async (c, next) => {
	const clerk = createClerkClient({
		secretKey: c.env.CLERK_SECRET_KEY,
		publishableKey: (c.env as unknown as { CLERK_PUBLISHABLE_KEY?: string })
			.CLERK_PUBLISHABLE_KEY,
	});
	const result = await clerk.authenticateRequest(c.req.raw, {
		authorizedParties: undefined,
	});
	if (!result.isAuthenticated) {
		return c.json({ error: "unauthenticated" }, 401);
	}
	const auth = result.toAuth();
	if (!auth?.userId) {
		return c.json({ error: "unauthenticated" }, 401);
	}
	c.set("userId", auth.userId);
	await next();
});

function redact(rec: PlaneConfigRecord): PlaneConfigRecord {
	return { ...rec, apiKey: redactApiKey(rec.apiKey) };
}

const createSchema = z.object({
	slug: z.string(),
	name: z.string().min(1),
	apiKey: z.string().min(1),
	baseUrl: z.string().url(),
	workspaceSlug: z.string().min(1),
	projectId: z.string().optional(),
});

const updateSchema = z.object({
	name: z.string().min(1).optional(),
	apiKey: z.string().min(1).optional(),
	baseUrl: z.string().url().optional(),
	workspaceSlug: z.string().min(1).optional(),
	projectId: z.string().nullable().optional(),
});

apiApp.get("/configs", async (c) => {
	const userId = c.get("userId");
	const configs = await listConfigs(c.env.OAUTH_KV, userId);
	return c.json({ configs: configs.map(redact) });
});

apiApp.post("/configs", async (c) => {
	const userId = c.get("userId");
	const body = await c.req.json().catch(() => null);
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) {
		return c.json(
			{ error: "invalid_body", details: parsed.error.format() },
			400,
		);
	}
	const slugCheck = validateSlug(parsed.data.slug);
	if (!slugCheck.ok) {
		return c.json({ error: slugCheck.error }, 400);
	}
	const existing = await loadConfig(c.env.OAUTH_KV, userId, parsed.data.slug);
	if (existing) {
		return c.json({ error: "slug_in_use" }, 409);
	}
	const now = new Date().toISOString();
	const record: PlaneConfigRecord = {
		...parsed.data,
		createdAt: now,
		updatedAt: now,
	};
	await saveConfig(c.env.OAUTH_KV, userId, record);
	return c.json(redact(record), 201);
});

apiApp.get("/configs/:slug", async (c) => {
	const userId = c.get("userId");
	const rec = await loadConfig(c.env.OAUTH_KV, userId, c.req.param("slug"));
	if (!rec) return c.json({ error: "not_found" }, 404);
	return c.json(redact(rec));
});

apiApp.patch("/configs/:slug", async (c) => {
	const userId = c.get("userId");
	const slug = c.req.param("slug");
	const existing = await loadConfig(c.env.OAUTH_KV, userId, slug);
	if (!existing) return c.json({ error: "not_found" }, 404);
	const body = await c.req.json().catch(() => null);
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) {
		return c.json(
			{ error: "invalid_body", details: parsed.error.format() },
			400,
		);
	}
	const next: PlaneConfigRecord = {
		...existing,
		name: parsed.data.name ?? existing.name,
		apiKey:
			parsed.data.apiKey && parsed.data.apiKey.length > 0
				? parsed.data.apiKey
				: existing.apiKey,
		baseUrl: parsed.data.baseUrl ?? existing.baseUrl,
		workspaceSlug: parsed.data.workspaceSlug ?? existing.workspaceSlug,
		projectId:
			parsed.data.projectId === null
				? undefined
				: (parsed.data.projectId ?? existing.projectId),
		updatedAt: new Date().toISOString(),
	};
	await saveConfig(c.env.OAUTH_KV, userId, next);
	return c.json(redact(next));
});

apiApp.delete("/configs/:slug", async (c) => {
	const userId = c.get("userId");
	await deleteConfig(c.env.OAUTH_KV, userId, c.req.param("slug"));
	return new Response(null, { status: 204 });
});

apiApp.post("/configs/:slug/test", async (c) => {
	const userId = c.get("userId");
	const rec = await loadConfig(c.env.OAUTH_KV, userId, c.req.param("slug"));
	if (!rec) return c.json({ error: "not_found" }, 404);
	try {
		const workspace = await planeFetch(
			{ apiKey: rec.apiKey, baseUrl: rec.baseUrl },
			"GET",
			`workspaces/${rec.workspaceSlug}`,
		);
		return c.json({ ok: true, workspace });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return c.json({ ok: false, error: message });
	}
});

apiApp.get("/configs/:slug/projects", async (c) => {
	const userId = c.get("userId");
	const rec = await loadConfig(c.env.OAUTH_KV, userId, c.req.param("slug"));
	if (!rec) return c.json({ error: "not_found" }, 404);
	try {
		const response = await planeFetch<{
			results?: Array<Record<string, unknown>>;
		}>(
			{ apiKey: rec.apiKey, baseUrl: rec.baseUrl },
			"GET",
			`workspaces/${rec.workspaceSlug}/projects`,
			{ params: { per_page: 100 } },
		);
		const items = (response?.results ?? []).map((p) => ({
			id: p.id,
			name: p.name,
			identifier: p.identifier,
		}));
		return c.json(items);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return c.json({ error: message }, 502);
	}
});

export { apiApp };
