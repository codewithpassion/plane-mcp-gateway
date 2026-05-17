import { type PlaneConfig, planeFetch } from "../client";
import type {
	PaginatedWorkItemActivityResponse,
	WorkItemActivity,
} from "../types/work_item_activities";

export async function listWorkItemActivities(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedWorkItemActivityResponse> {
	return planeFetch<PaginatedWorkItemActivityResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/activities`,
		{ params },
	);
}

export async function retrieveWorkItemActivity(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	activityId: string,
): Promise<WorkItemActivity> {
	return planeFetch<WorkItemActivity>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/activities/${activityId}`,
	);
}
