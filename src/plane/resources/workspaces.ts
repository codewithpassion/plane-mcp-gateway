import { type PlaneConfig, planeFetch } from "../client";
import type { WorkspaceFeature, WorkspaceMember } from "../types/workspaces";

export async function getWorkspaceMembers(
	cfg: PlaneConfig,
	workspaceSlug: string,
): Promise<WorkspaceMember[]> {
	return planeFetch<WorkspaceMember[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/members`,
	);
}

export async function getWorkspaceFeatures(
	cfg: PlaneConfig,
	workspaceSlug: string,
): Promise<WorkspaceFeature> {
	return planeFetch<WorkspaceFeature>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/features`,
	);
}

export async function updateWorkspaceFeatures(
	cfg: PlaneConfig,
	workspaceSlug: string,
	body: Record<string, unknown>,
): Promise<WorkspaceFeature> {
	return planeFetch<WorkspaceFeature>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/features`,
		{ body },
	);
}
