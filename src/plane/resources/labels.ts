import { type PlaneConfig, planeFetch } from "../client";
import type { Label, PaginatedLabelResponse } from "../types/labels";

export async function listLabels(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedLabelResponse> {
	return planeFetch<PaginatedLabelResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/labels`,
		{ params },
	);
}

export async function createLabel(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<Label> {
	return planeFetch<Label>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/labels`,
		{ body },
	);
}

export async function retrieveLabel(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	labelId: string,
): Promise<Label> {
	return planeFetch<Label>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`,
	);
}

export async function updateLabel(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	labelId: string,
	body: Record<string, unknown>,
): Promise<Label> {
	return planeFetch<Label>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`,
		{ body },
	);
}

export async function deleteLabel(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	labelId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/labels/${labelId}`,
	);
}
