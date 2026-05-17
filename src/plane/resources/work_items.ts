import { type PlaneConfig, planeFetch } from "../client";
import type {
	AdvancedSearchResult,
	PaginatedWorkItemResponse,
	WorkItem,
	WorkItemDetail,
	WorkItemSearch,
} from "../types/work_items";

export async function listWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedWorkItemResponse> {
	return planeFetch<PaginatedWorkItemResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items`,
		{ params },
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

export async function retrieveWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	params?: Record<string, unknown>,
): Promise<WorkItemDetail> {
	return planeFetch<WorkItemDetail>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}`,
		{ params },
	);
}

export async function retrieveWorkItemByIdentifier(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectIdentifier: string,
	issueIdentifier: number,
	params?: Record<string, unknown>,
): Promise<WorkItemDetail> {
	return planeFetch<WorkItemDetail>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/work-items/${projectIdentifier}-${issueIdentifier}`,
		{ params },
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

export async function searchWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	params: Record<string, unknown>,
): Promise<WorkItemSearch> {
	return planeFetch<WorkItemSearch>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/work-items/search`,
		{ params },
	);
}

export async function advancedSearchWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	body: Record<string, unknown>,
): Promise<AdvancedSearchResult[]> {
	return planeFetch<AdvancedSearchResult[]>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/work-items/advanced-search`,
		{ body },
	);
}
