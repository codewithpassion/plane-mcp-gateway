import { type PlaneConfig, planeFetch } from "../client";
import type { WorkItemType } from "../types/work_item_types";

export async function listWorkItemTypes(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<WorkItemType[]> {
	return planeFetch<WorkItemType[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types`,
		{ params },
	);
}

export async function createWorkItemType(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<WorkItemType> {
	return planeFetch<WorkItemType>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types`,
		{ body },
	);
}

export async function retrieveWorkItemType(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemTypeId: string,
): Promise<WorkItemType> {
	return planeFetch<WorkItemType>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${workItemTypeId}`,
	);
}

export async function updateWorkItemType(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemTypeId: string,
	body: Record<string, unknown>,
): Promise<WorkItemType> {
	return planeFetch<WorkItemType>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${workItemTypeId}`,
		{ body },
	);
}

export async function deleteWorkItemType(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemTypeId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${workItemTypeId}`,
	);
}
