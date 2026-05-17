import { type PlaneConfig, planeFetch } from "../client";
import type {
	Initiative,
	PaginatedInitiativeResponse,
} from "../types/initiatives";

export async function listInitiatives(
	cfg: PlaneConfig,
	workspaceSlug: string,
	params?: Record<string, unknown>,
): Promise<PaginatedInitiativeResponse> {
	return planeFetch<PaginatedInitiativeResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/initiatives`,
		{ params },
	);
}

export async function createInitiative(
	cfg: PlaneConfig,
	workspaceSlug: string,
	body: Record<string, unknown>,
): Promise<Initiative> {
	return planeFetch<Initiative>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/initiatives`,
		{ body },
	);
}

export async function retrieveInitiative(
	cfg: PlaneConfig,
	workspaceSlug: string,
	initiativeId: string,
): Promise<Initiative> {
	return planeFetch<Initiative>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/initiatives/${initiativeId}`,
	);
}

export async function updateInitiative(
	cfg: PlaneConfig,
	workspaceSlug: string,
	initiativeId: string,
	body: Record<string, unknown>,
): Promise<Initiative> {
	return planeFetch<Initiative>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/initiatives/${initiativeId}`,
		{ body },
	);
}

export async function deleteInitiative(
	cfg: PlaneConfig,
	workspaceSlug: string,
	initiativeId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/initiatives/${initiativeId}`,
	);
}
