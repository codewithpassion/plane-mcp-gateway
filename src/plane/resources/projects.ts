import { type PlaneConfig, planeFetch } from "../client";
import type {
	PaginatedProjectResponse,
	Project,
	ProjectFeature,
	ProjectMember,
	ProjectWorklogSummary,
} from "../types/projects";

export async function listProjects(
	cfg: PlaneConfig,
	workspaceSlug: string,
	params?: Record<string, unknown>,
): Promise<PaginatedProjectResponse> {
	return planeFetch<PaginatedProjectResponse>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects`,
		{ params },
	);
}

export async function createProject(
	cfg: PlaneConfig,
	workspaceSlug: string,
	body: Record<string, unknown>,
): Promise<Project> {
	return planeFetch<Project>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects`,
		{ body },
	);
}

export async function retrieveProject(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
): Promise<Project> {
	return planeFetch<Project>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}`,
	);
}

export async function updateProject(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<Project> {
	return planeFetch<Project>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}`,
		{ body },
	);
}

export async function deleteProject(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
): Promise<void> {
	await planeFetch(
		cfg,
		"DELETE",
		`workspaces/${workspaceSlug}/projects/${projectId}`,
	);
}

export async function getProjectWorklogSummary(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
): Promise<ProjectWorklogSummary[]> {
	return planeFetch<ProjectWorklogSummary[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/total-worklogs`,
	);
}

export async function getProjectMembers(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	params?: Record<string, unknown>,
): Promise<ProjectMember[]> {
	return planeFetch<ProjectMember[]>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/members`,
		{ params },
	);
}

export async function getProjectFeatures(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
): Promise<ProjectFeature> {
	return planeFetch<ProjectFeature>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/features`,
	);
}

export async function updateProjectFeatures(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<ProjectFeature> {
	return planeFetch<ProjectFeature>(
		cfg,
		"PATCH",
		`workspaces/${workspaceSlug}/projects/${projectId}/features`,
		{ body },
	);
}
