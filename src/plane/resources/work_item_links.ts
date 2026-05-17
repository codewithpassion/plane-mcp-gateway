import { type PlaneConfig, planeFetch } from "../client";
import type {
	PaginatedWorkItemLinkResponse,
	WorkItemLink,
} from "../types/work_item_links";

export async function listWorkItemLinks(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedWorkItemLinkResponse> {
	return planeFetch<PaginatedWorkItemLinkResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/links`,
		{ params },
	);
}

export async function retrieveWorkItemLink(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	linkId: string,
): Promise<WorkItemLink> {
	return planeFetch<WorkItemLink>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/links/${linkId}`,
	);
}

export async function createWorkItemLink(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<WorkItemLink> {
	return planeFetch<WorkItemLink>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/links`,
		{ body },
	);
}

export async function updateWorkItemLink(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	linkId: string,
	body: Record<string, unknown>,
): Promise<WorkItemLink> {
	return planeFetch<WorkItemLink>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/links/${linkId}`,
		{ body },
	);
}

export async function deleteWorkItemLink(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	linkId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/links/${linkId}`,
	);
}
