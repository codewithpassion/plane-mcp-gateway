import { type PlaneConfig, planeFetch } from "../client";
import type {
	Epic,
	PaginatedEpicResponse,
	WorkItem,
	WorkItemType,
} from "../types/epics";

export async function listEpics(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedEpicResponse> {
	return planeFetch<PaginatedEpicResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/epics`,
		{ params },
	);
}

export async function retrieveEpic(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	epicId: string,
	params?: Record<string, unknown>,
): Promise<Epic> {
	return planeFetch<Epic>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/epics/${epicId}`,
		{ params },
	);
}

export async function listWorkItemTypes(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
): Promise<WorkItemType[]> {
	return planeFetch<WorkItemType[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-item-types`,
	);
}

export async function createWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<WorkItem> {
	return planeFetch<WorkItem>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items`,
		{ body },
	);
}

export async function updateWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<WorkItem> {
	return planeFetch<WorkItem>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}`,
		{ body },
	);
}

export async function deleteWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}`,
	);
}
