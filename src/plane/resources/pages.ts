import { type PlaneConfig, planeFetch } from "../client";
import type { Page } from "../types/pages";

export async function retrieveWorkspacePage(
	cfg: PlaneConfig,
	workspaceSlug: string,
	pageId: string,
	params?: Record<string, unknown>,
): Promise<Page> {
	return planeFetch<Page>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/pages/${pageId}`,
		{ params },
	);
}

export async function retrieveProjectPage(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	pageId: string,
	params?: Record<string, unknown>,
): Promise<Page> {
	return planeFetch<Page>(
		cfg,
		"GET",
		`workspaces/${workspaceSlug}/projects/${projectId}/pages/${pageId}`,
		{ params },
	);
}

export async function createWorkspacePage(
	cfg: PlaneConfig,
	workspaceSlug: string,
	body: Record<string, unknown>,
): Promise<Page> {
	return planeFetch<Page>(cfg, "POST", `workspaces/${workspaceSlug}/pages`, {
		body,
	});
}

export async function createProjectPage(
	cfg: PlaneConfig,
	workspaceSlug: string,
	projectId: string,
	body: Record<string, unknown>,
): Promise<Page> {
	return planeFetch<Page>(
		cfg,
		"POST",
		`workspaces/${workspaceSlug}/projects/${projectId}/pages`,
		{ body },
	);
}
