import { type PlaneConfig, planeFetch } from "../client";
import type { PaginatedStateResponse, State } from "../types/states";

export async function listStates(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedStateResponse> {
	return planeFetch<PaginatedStateResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/states`,
		{ params },
	);
}

export async function createState(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<State> {
	return planeFetch<State>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/states`,
		{ body },
	);
}

export async function retrieveState(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	stateId: string,
): Promise<State> {
	return planeFetch<State>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}`,
	);
}

export async function updateState(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	stateId: string,
	body: Record<string, unknown>,
): Promise<State> {
	return planeFetch<State>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}`,
		{ body },
	);
}

export async function deleteState(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	stateId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/states/${stateId}`,
	);
}
