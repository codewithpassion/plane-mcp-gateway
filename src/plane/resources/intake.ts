import { type PlaneConfig, planeFetch } from "../client";
import type {
	IntakeWorkItem,
	PaginatedIntakeWorkItemResponse,
} from "../types/intake";

export async function listIntakeWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedIntakeWorkItemResponse> {
	return planeFetch<PaginatedIntakeWorkItemResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/intake-issues`,
		{ params },
	);
}

export async function createIntakeWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<IntakeWorkItem> {
	return planeFetch<IntakeWorkItem>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/intake-issues`,
		{ body },
	);
}

export async function retrieveIntakeWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	params?: Record<string, unknown>,
): Promise<IntakeWorkItem> {
	return planeFetch<IntakeWorkItem>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/intake-issues/${workItemId}`,
		{ params },
	);
}

export async function updateIntakeWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
	body: Record<string, unknown>,
): Promise<IntakeWorkItem> {
	return planeFetch<IntakeWorkItem>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/intake-issues/${workItemId}`,
		{ body },
	);
}

export async function deleteIntakeWorkItem(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	workItemId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/intake-issues/${workItemId}`,
	);
}
