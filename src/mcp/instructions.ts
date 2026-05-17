import { planeFetch } from "../plane/client";
import type { PlaneConfigRecord } from "../plane/storage";

export interface PlaneProjectSummary {
	id: string;
	name: string;
	identifier: string;
}

export async function fetchProjects(
	record: PlaneConfigRecord,
): Promise<PlaneProjectSummary[]> {
	try {
		const response = await planeFetch<{
			results?: Array<Record<string, unknown>>;
		}>(
			{ apiKey: record.apiKey, baseUrl: record.baseUrl },
			"GET",
			`workspaces/${record.workspaceSlug}/projects`,
			{ params: { per_page: 100 } },
		);
		return (response?.results ?? []).map((p) => ({
			id: String(p.id ?? ""),
			name: String(p.name ?? ""),
			identifier: String(p.identifier ?? ""),
		}));
	} catch {
		return [];
	}
}

export async function fetchWorkspaceName(
	record: PlaneConfigRecord,
): Promise<string | undefined> {
	try {
		const ws = await planeFetch<Record<string, unknown>>(
			{ apiKey: record.apiKey, baseUrl: record.baseUrl },
			"GET",
			`workspaces/${record.workspaceSlug}`,
		);
		return typeof ws?.name === "string" ? ws.name : undefined;
	} catch {
		return undefined;
	}
}

export function renderInstructions(opts: {
	record: PlaneConfigRecord;
	workspaceName?: string;
	projects: PlaneProjectSummary[];
}): string {
	const { record, workspaceName, projects } = opts;
	const wsName = workspaceName ?? record.workspaceSlug;
	const wsUrl = `${record.baseUrl.replace(/\/+$/, "")}/${record.workspaceSlug}`;
	const lines: string[] = [];
	lines.push(
		"This server gateways the Plane API for a specific workspace via this user's saved configuration.",
	);
	lines.push("");
	lines.push(`Workspace: ${wsName} (slug: ${record.workspaceSlug})`);
	lines.push(`Workspace URL: ${wsUrl}`);
	if (record.projectId) {
		const pinned = projects.find((p) => p.id === record.projectId);
		lines.push(
			`Pinned project: ${pinned ? `${pinned.identifier} — ${pinned.name} (${pinned.id})` : record.projectId}`,
		);
	}
	lines.push("");
	if (projects.length > 0) {
		lines.push("Projects in this workspace:");
		lines.push("identifier | name | id");
		lines.push("-----------|------|---");
		for (const p of projects) {
			lines.push(`${p.identifier} | ${p.name} | ${p.id}`);
		}
		lines.push("");
	}
	lines.push("URL patterns (substitute the ids from tool results):");
	lines.push(
		`  Work item:    ${wsUrl}/projects/<project_id>/work-items/<work_item_id>/`,
	);
	lines.push(`  Project home: ${wsUrl}/projects/<project_id>/`);
	lines.push(
		`  Cycle:        ${wsUrl}/projects/<project_id>/cycles/<cycle_id>/`,
	);
	lines.push(
		`  Module:       ${wsUrl}/projects/<project_id>/modules/<module_id>/`,
	);
	lines.push(`  Page:         ${wsUrl}/projects/<project_id>/pages/<page_id>/`);
	lines.push("");
	lines.push(
		"Tool results for create/retrieve/list operations include a `web_url` field when applicable; prefer that over constructing URLs by hand.",
	);
	return lines.join("\n");
}
