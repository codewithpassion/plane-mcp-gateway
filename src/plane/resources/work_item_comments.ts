import { type PlaneConfig, planeFetch } from "../client";
import type {
	PaginatedWorkItemCommentResponse,
	WorkItemComment,
} from "../types/work_item_comments";

export async function listWorkItemComments(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedWorkItemCommentResponse> {
	return planeFetch<PaginatedWorkItemCommentResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/comments`,
		{ params },
	);
}

export async function retrieveWorkItemComment(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	commentId: string,
): Promise<WorkItemComment> {
	return planeFetch<WorkItemComment>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`,
	);
}

export async function createWorkItemComment(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<WorkItemComment> {
	return planeFetch<WorkItemComment>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/comments`,
		{ body },
	);
}

export async function updateWorkItemComment(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	commentId: string,
	body: Record<string, unknown>,
): Promise<WorkItemComment> {
	return planeFetch<WorkItemComment>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`,
		{ body },
	);
}

export async function deleteWorkItemComment(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	commentId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/comments/${commentId}`,
	);
}
