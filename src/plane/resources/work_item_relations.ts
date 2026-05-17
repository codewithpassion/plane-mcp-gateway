import { type PlaneConfig, planeFetch } from "../client";
import type { WorkItemRelationResponse } from "../types/work_item_relations";

export async function listWorkItemRelations(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
): Promise<WorkItemRelationResponse> {
	return planeFetch<WorkItemRelationResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/relations`,
	);
}

export async function createWorkItemRelation(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/relations`,
		{ body },
	);
}

export async function removeWorkItemRelation(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/relations/remove`,
		{ body },
	);
}
