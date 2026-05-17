import { type PlaneConfig, planeFetch } from "../client";
import type {
	Cycle,
	PaginatedArchivedCycleResponse,
	PaginatedCycleResponse,
	PaginatedCycleWorkItemResponse,
} from "../types/cycles";

export async function listCycles(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedCycleResponse> {
	return planeFetch<PaginatedCycleResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles`,
		{ params },
	);
}

export async function createCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<Cycle> {
	return planeFetch<Cycle>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles`,
		{ body },
	);
}

export async function retrieveCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
): Promise<Cycle> {
	return planeFetch<Cycle>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
	);
}

export async function updateCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
	body: Record<string, unknown>,
): Promise<Cycle> {
	return planeFetch<Cycle>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
		{ body },
	);
}

export async function deleteCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}`,
	);
}

export async function listArchivedCycles(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedArchivedCycleResponse> {
	return planeFetch<PaginatedArchivedCycleResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles`,
		{ params },
	);
}

export async function addWorkItemsToCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
	workItemIds: string[],
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues`,
		{ body: { issues: workItemIds } },
	);
}

export async function removeWorkItemFromCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
	workItemId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/${workItemId}`,
	);
}

export async function listCycleWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedCycleWorkItemResponse> {
	return planeFetch<PaginatedCycleWorkItemResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues`,
		{ params },
	);
}

export async function transferCycleWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
	newCycleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/transfer-issues`,
		{ body: { new_cycle_id: newCycleId } },
	);
}

export async function archiveCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive`,
		{ body: {} },
	);
}

export async function unarchiveCycle(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	cycleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/${cycleId}/unarchive`,
	);
}
