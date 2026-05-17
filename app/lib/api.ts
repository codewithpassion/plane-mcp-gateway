import { useAuth } from "@clerk/clerk-react";
import { useCallback, useMemo } from "react";

export interface PlaneConfigRecord {
	slug: string;
	name: string;
	baseUrl: string;
	workspaceSlug: string;
	projectId?: string;
	/** Redacted on the wire; never the real key. */
	apiKey: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateConfigInput {
	slug: string;
	name: string;
	apiKey: string;
	baseUrl: string;
	workspaceSlug: string;
	projectId?: string;
}

export type UpdateConfigInput = Partial<
	Pick<
		CreateConfigInput,
		"name" | "apiKey" | "baseUrl" | "workspaceSlug" | "projectId"
	>
>;

export interface TestConnectionResult {
	ok: boolean;
	workspace?: unknown;
	error?: string;
}

export interface PlaneProject {
	id: string;
	name: string;
	identifier: string;
}

type Fetcher = <T>(
	path: string,
	init?: RequestInit & { json?: unknown },
) => Promise<T>;

async function parseJson<T>(res: Response): Promise<T> {
	const text = await res.text();
	if (!res.ok) {
		let message = res.statusText;
		try {
			const body = text ? JSON.parse(text) : null;
			if (body && typeof body === "object" && "error" in body) {
				message = String((body as { error: unknown }).error);
			}
		} catch {
			if (text) message = text;
		}
		throw new Error(`${res.status} ${message}`);
	}
	return (text ? JSON.parse(text) : (undefined as unknown)) as T;
}

/**
 * Hook returning a typed API client for /api/configs* endpoints.
 * Every call automatically attaches the Clerk session token.
 */
export function useApi() {
	const { getToken, isSignedIn } = useAuth();

	const request: Fetcher = useCallback(
		async (path, init = {}) => {
			const token = isSignedIn ? await getToken() : null;
			const headers = new Headers(init.headers);
			if (token) headers.set("Authorization", `Bearer ${token}`);
			let body = init.body;
			if (init.json !== undefined) {
				headers.set("Content-Type", "application/json");
				body = JSON.stringify(init.json);
			}
			const res = await fetch(path, { ...init, headers, body });
			if (res.status === 204) return undefined as never;
			return parseJson(res);
		},
		[getToken, isSignedIn],
	);

	return useMemo(
		() => ({
			listConfigs: () =>
				request<{ configs: PlaneConfigRecord[] }>("/api/configs"),

			getConfig: (slug: string) =>
				request<PlaneConfigRecord>(`/api/configs/${encodeURIComponent(slug)}`),

			createConfig: (input: CreateConfigInput) =>
				request<PlaneConfigRecord>("/api/configs", {
					method: "POST",
					json: input,
				}),

			updateConfig: (slug: string, input: UpdateConfigInput) =>
				request<PlaneConfigRecord>(`/api/configs/${encodeURIComponent(slug)}`, {
					method: "PATCH",
					json: input,
				}),

			deleteConfig: (slug: string) =>
				request<void>(`/api/configs/${encodeURIComponent(slug)}`, {
					method: "DELETE",
				}),

			testConnection: (slug: string) =>
				request<TestConnectionResult>(
					`/api/configs/${encodeURIComponent(slug)}/test`,
					{ method: "POST" },
				),

			listProjects: (slug: string) =>
				request<PlaneProject[]>(
					`/api/configs/${encodeURIComponent(slug)}/projects`,
				),

			listSavedConfigProjects: (slug: string) =>
				request<PlaneProject[]>(
					`/api/configs/${encodeURIComponent(slug)}/projects`,
				),

			previewProjects: (input: {
				apiKey: string;
				baseUrl: string;
				workspaceSlug: string;
			}) =>
				request<PlaneProject[]>("/api/configs/projects-preview", {
					method: "POST",
					json: input,
				}),
		}),
		[request],
	);
}
