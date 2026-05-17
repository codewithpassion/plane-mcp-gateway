export interface PlaneConfigRecord {
	slug: string;
	name: string;
	apiKey: string;
	baseUrl: string;
	workspaceSlug: string;
	projectId?: string;
	createdAt: string;
	updatedAt: string;
}

const RESERVED_SLUGS = new Set<string>([
	"well-known",
	"mcp",
	"sse",
	"api",
	"app",
	"sign-in",
	"sign-up",
	"authorize",
	"callback",
	"register",
	"token",
	"public",
	"static",
	"admin",
	"login",
	"logout",
]);

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export function validateSlug(
	slug: string,
): { ok: true } | { ok: false; error: string } {
	if (!slug) return { ok: false, error: "slug is required" };
	if (!SLUG_REGEX.test(slug)) {
		return {
			ok: false,
			error:
				"slug must be 1-64 chars, lowercase alphanumeric + dashes, not leading/trailing dash",
		};
	}
	if (RESERVED_SLUGS.has(slug)) {
		return { ok: false, error: `slug "${slug}" is reserved` };
	}
	return { ok: true };
}

export function redactApiKey(apiKey: string): string {
	if (!apiKey) return "";
	const last4 = apiKey.slice(-4);
	return `••••${last4}`;
}

export function cfgKey(userId: string, slug: string): string {
	return `plane:cfg:${userId}:${slug}`;
}

export function cfgPrefix(userId: string): string {
	return `plane:cfg:${userId}:`;
}

export async function loadConfig(
	kv: KVNamespace,
	userId: string,
	slug: string,
): Promise<PlaneConfigRecord | null> {
	const raw = await kv.get(cfgKey(userId, slug));
	if (!raw) return null;
	try {
		return JSON.parse(raw) as PlaneConfigRecord;
	} catch {
		return null;
	}
}

export async function saveConfig(
	kv: KVNamespace,
	userId: string,
	record: PlaneConfigRecord,
): Promise<void> {
	await kv.put(cfgKey(userId, record.slug), JSON.stringify(record));
}

export async function deleteConfig(
	kv: KVNamespace,
	userId: string,
	slug: string,
): Promise<void> {
	await kv.delete(cfgKey(userId, slug));
}

export async function listConfigs(
	kv: KVNamespace,
	userId: string,
): Promise<PlaneConfigRecord[]> {
	const out: PlaneConfigRecord[] = [];
	let cursor: string | undefined;
	do {
		const page = await kv.list({ prefix: cfgPrefix(userId), cursor });
		const reads = await Promise.all(
			page.keys.map(async (k) => {
				const raw = await kv.get(k.name);
				if (!raw) return null;
				try {
					return JSON.parse(raw) as PlaneConfigRecord;
				} catch {
					return null;
				}
			}),
		);
		for (const r of reads) if (r) out.push(r);
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);
	return out;
}
