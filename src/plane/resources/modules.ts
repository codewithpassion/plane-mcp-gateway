import { type PlaneConfig, planeFetch } from "../client";
import type {
	Module,
	PaginatedArchivedModuleResponse,
	PaginatedModuleResponse,
	PaginatedModuleWorkItemResponse,
} from "../types/modules";

export async function listModules(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedModuleResponse> {
	return planeFetch<PaginatedModuleResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules`,
		{ params },
	);
}

export async function createModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<Module> {
	return planeFetch<Module>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules`,
		{ body },
	);
}

export async function retrieveModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
): Promise<Module> {
	return planeFetch<Module>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
	);
}

export async function updateModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
	body: Record<string, unknown>,
): Promise<Module> {
	return planeFetch<Module>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
		{ body },
	);
}

export async function deleteModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}`,
	);
}

export async function listArchivedModules(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedArchivedModuleResponse> {
	return planeFetch<PaginatedArchivedModuleResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/archived-modules`,
		{ params },
	);
}

export async function addWorkItemsToModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
	workItemIds: string[],
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/module-issues`,
		{ body: { issues: workItemIds } },
	);
}

export async function removeWorkItemFromModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
	workItemId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/module-issues/${workItemId}`,
	);
}

export async function listModuleWorkItems(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
	params?: Record<string, unknown>,
): Promise<PaginatedModuleWorkItemResponse> {
	return planeFetch<PaginatedModuleWorkItemResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/module-issues`,
		{ params },
	);
}

export async function archiveModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/modules/${moduleId}/archive`,
		{ body: {} },
	);
}

export async function unarchiveModule(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	moduleId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}/archived-modules/${moduleId}/unarchive`,
	);
}
