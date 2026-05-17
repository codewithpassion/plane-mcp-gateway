import { ConfigurationError, HttpError } from "./errors";

export interface PlaneConfig {
	apiKey?: string;
	accessToken?: string;
	baseUrl: string;
}

export interface PlaneAppContext {
	config: PlaneConfig;
	workspaceSlug: string;
	projectId?: string;
}

export interface PlaneFetchOptions {
	params?: Record<string, unknown>;
	body?: unknown;
}

const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
const RETRY_METHODS = new Set([
	"GET",
	"PUT",
	"DELETE",
	"HEAD",
	"OPTIONS",
	"PATCH",
]);
const MAX_RETRIES = 3;
const BACKOFF_FACTOR_MS = 300;

function buildUrl(
	baseUrl: string,
	path: string,
	params?: Record<string, unknown>,
): string {
	const trimmedBase = baseUrl.replace(/\/+$/, "");
	const trimmedPath = path.replace(/^\/+/, "").replace(/\/+$/, "");
	let url = `${trimmedBase}/api/v1/${trimmedPath}/`;
	if (params) {
		const search = new URLSearchParams();
		for (const [k, v] of Object.entries(params)) {
			if (v === undefined || v === null) continue;
			if (Array.isArray(v)) {
				for (const item of v) search.append(k, String(item));
			} else {
				search.append(k, String(v));
			}
		}
		const qs = search.toString();
		if (qs) url += `?${qs}`;
	}
	return url;
}

function authHeaders(config: PlaneConfig): Record<string, string> {
	const h: Record<string, string> = { "Content-Type": "application/json" };
	if (config.apiKey) h["X-Api-Key"] = config.apiKey;
	if (config.accessToken) h.Authorization = `Bearer ${config.accessToken}`;
	return h;
}

export async function planeFetch<T = unknown>(
	config: PlaneConfig,
	method: string,
	path: string,
	opts: PlaneFetchOptions = {},
): Promise<T> {
	if (!config.apiKey && !config.accessToken) {
		throw new ConfigurationError(
			"Either apiKey or accessToken must be provided for authentication",
		);
	}
	const url = buildUrl(config.baseUrl, path, opts.params);
	const init: RequestInit = {
		method,
		headers: authHeaders(config),
	};
	if (opts.body !== undefined && opts.body !== null) {
		init.body = JSON.stringify(opts.body);
	}

	let lastErr: unknown;
	let attempt = 0;
	const upperMethod = method.toUpperCase();
	while (attempt <= MAX_RETRIES) {
		try {
			const res = await fetch(url, init);
			if (
				RETRY_STATUS.has(res.status) &&
				RETRY_METHODS.has(upperMethod) &&
				attempt < MAX_RETRIES
			) {
				const retryAfter = res.headers.get("retry-after");
				const wait = retryAfter
					? Number(retryAfter) * 1000
					: BACKOFF_FACTOR_MS * 2 ** attempt;
				await new Promise((r) => setTimeout(r, wait));
				attempt += 1;
				continue;
			}
			if (res.status === 204) return null as T;
			const ct = res.headers.get("content-type") ?? "";
			const isJson = ct.toLowerCase().includes("application/json");
			let payload: unknown = null;
			if (res.status !== 204) {
				const text = await res.text();
				if (text) payload = isJson ? JSON.parse(text) : text;
			}
			if (res.status >= 200 && res.status < 300) {
				return payload as T;
			}
			throw new HttpError(
				`HTTP ${res.status}: ${res.statusText}`,
				res.status,
				payload,
			);
		} catch (err) {
			if (err instanceof HttpError) throw err;
			lastErr = err;
			if (attempt >= MAX_RETRIES || !RETRY_METHODS.has(upperMethod)) throw err;
			await new Promise((r) => setTimeout(r, BACKOFF_FACTOR_MS * 2 ** attempt));
			attempt += 1;
		}
	}
	throw lastErr;
}
