import { type PlaneConfig, planeFetch } from "../client";
import type {
	Milestone,
	PaginatedMilestoneResponse,
	PaginatedMilestoneWorkItemResponse,
} from "../types/milestones";

export async function listMilestones(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedMilestoneResponse> {
	return planeFetch<PaginatedMilestoneResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones`,
		{ params },
	);
}

export async function createMilestone(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<Milestone> {
	return planeFetch<Milestone>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones`,
		{ body },
	);
}

export async function retrieveMilestone(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	milestoneId: string,
): Promise<Milestone> {
	return planeFetch<Milestone>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}`,
	);
}

export async function updateMilestone(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	milestoneId: string,
	body: Record<string, unknown>,
): Promise<Milestone> {
	return planeFetch<Milestone>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}`,
		{ body },
	);
}

export async function deleteMilestone(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	milestoneId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}`,
	);
}

export async function addWorkItemsToMilestone(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	milestoneId: string,
	issueIds: string[],
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/work-items`,
		{ body: { issues: issueIds } },
	);
}

export async function removeWorkItemsFromMilestone(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	milestoneId: string,
	issueIds: string[],
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/work-items`,
		{ body: { issues: issueIds } },
	);
}

export async function listMilestoneWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	milestoneId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedMilestoneWorkItemResponse> {
	return planeFetch<PaginatedMilestoneWorkItemResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/work-items`,
		{ params },
	);
}
