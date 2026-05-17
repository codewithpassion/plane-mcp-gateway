import { type PlaneConfig, planeFetch } from "../client";
import type { WorkItemWorkLog } from "../types/work_logs";

export async function listWorkLogs(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	params?: Record<string, unknown>,
): Promise<WorkItemWorkLog[]> {
	return planeFetch<WorkItemWorkLog[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/worklogs`,
		{ params },
	);
}

export async function createWorkLog(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<WorkItemWorkLog> {
	return planeFetch<WorkItemWorkLog>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/worklogs`,
		{ body },
	);
}

export async function updateWorkLog(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	workLogId: string,
	body: Record<string, unknown>,
): Promise<WorkItemWorkLog> {
	return planeFetch<WorkItemWorkLog>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/worklogs/${workLogId}`,
		{ body },
	);
}

export async function deleteWorkLog(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	workLogId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/work-items/${workItemId}/worklogs/${workLogId}`,
	);
}
