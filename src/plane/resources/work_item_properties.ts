import { type PlaneConfig, planeFetch } from "../client";
import type { WorkItemProperty } from "../types/work_item_properties";

export async function listWorkItemProperties(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	typeId: string,
	params?: Record<string, unknown>,
): Promise<WorkItemProperty[]> {
	return planeFetch<WorkItemProperty[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${typeId}/work-item-properties`,
		{ params },
	);
}

export async function createWorkItemProperty(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	typeId: string,
	body: Record<string, unknown>,
): Promise<WorkItemProperty> {
	return planeFetch<WorkItemProperty>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${typeId}/work-item-properties`,
		{ body },
	);
}

export async function retrieveWorkItemProperty(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	typeId: string,
	workItemPropertyId: string,
): Promise<WorkItemProperty> {
	return planeFetch<WorkItemProperty>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${typeId}/work-item-properties/${workItemPropertyId}`,
	);
}

export async function updateWorkItemProperty(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	typeId: string,
	workItemPropertyId: string,
	body: Record<string, unknown>,
): Promise<WorkItemProperty> {
	return planeFetch<WorkItemProperty>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${typeId}/work-item-properties/${workItemPropertyId}`,
		{ body },
	);
}

export async function deleteWorkItemProperty(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	typeId: string,
	workItemPropertyId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types/${typeId}/work-item-properties/${workItemPropertyId}`,
	);
}
