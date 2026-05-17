export type PlaneConfigRecord = {
	slug: string;
	displayName: string;
	planeWorkspaceSlug: string;
	apiKey: string;
	baseUrl?: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateConfigInput = {
	slug: string;
	displayName: string;
	planeWorkspaceSlug: string;
	apiKey: string;
	baseUrl?: string;
};

export type UpdateConfigInput = Partial<Omit<CreateConfigInput, "slug">>;

export type TestResult =
	| { ok: true; workspace?: Record<string, unknown> }
	| { ok: false; error: string };

async function request<T>(input: string, init?: RequestInit): Promise<T> {
	const res = await fetch(input, {
		...init,
		headers: {
			...(init?.body ? { "content-type": "application/json" } : {}),
			...init?.headers,
		},
	});
	if (res.status === 204) return undefined as T;
	const text = await res.text();
	const data = text ? JSON.parse(text) : null;
	if (!res.ok) {
		const message =
			(data && (data.error || data.message)) || `HTTP ${res.status}`;
		throw new Error(message);
	}
	return data as T;
}

export const api = {
	list: () => request<PlaneConfigRecord[]>("/api/configs"),
	get: (slug: string) =>
		request<PlaneConfigRecord>(`/api/configs/${encodeURIComponent(slug)}`),
	create: (body: CreateConfigInput) =>
		request<PlaneConfigRecord>("/api/configs", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	update: (slug: string, body: UpdateConfigInput) =>
		request<PlaneConfigRecord>(`/api/configs/${encodeURIComponent(slug)}`, {
			method: "PATCH",
			body: JSON.stringify(body),
		}),
	remove: (slug: string) =>
		request<void>(`/api/configs/${encodeURIComponent(slug)}`, {
			method: "DELETE",
		}),
	test: (slug: string) =>
		request<TestResult>(`/api/configs/${encodeURIComponent(slug)}/test`, {
			method: "POST",
		}),
};
