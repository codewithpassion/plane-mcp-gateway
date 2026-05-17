import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { type PlaneConfigRecord, useApi } from "~/lib/api";

export const Route = createFileRoute("/app/configs/")({
	component: ConfigsList,
});

function ConfigsList() {
	const api = useApi();
	const [configs, setConfigs] = useState<PlaneConfigRecord[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		api
			.listConfigs()
			.then((r) => {
				if (active) setConfigs(r.configs);
			})
			.catch((err: Error) => {
				if (active) setError(err.message);
			});
		return () => {
			active = false;
		};
	}, [api]);

	const origin = typeof window !== "undefined" ? window.location.origin : "";

	const copy = async (text: string, label = "URL") => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`${label} copied`);
		} catch {
			toast.error("Copy failed");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Plane configurations</h1>
					<p className="text-sm text-[var(--color-muted-foreground)]">
						Each config exposes a per-user MCP endpoint.
					</p>
				</div>
				<Button asChild>
					<Link to="/app/configs/new">
						<Plus className="h-4 w-4" />
						New
					</Link>
				</Button>
			</div>

			{error && (
				<Card>
					<CardContent className="pt-6 text-sm text-[var(--color-destructive)]">
						{error}
					</CardContent>
				</Card>
			)}

			{!error && configs === null && (
				<div className="text-sm text-[var(--color-muted-foreground)]">
					Loading...
				</div>
			)}

			{configs && configs.length === 0 && (
				<Card>
					<CardContent className="pt-6 text-sm text-[var(--color-muted-foreground)]">
						No configurations yet. Click "New" to create one.
					</CardContent>
				</Card>
			)}

			<div className="grid gap-3">
				{configs?.map((c) => {
					const mcpUrl = `${origin}/mcp/${c.slug}`;
					return (
						<Card key={c.slug}>
							<CardHeader>
								<div className="flex items-start justify-between gap-4">
									<div>
										<CardTitle>
											<Link
												to="/app/configs/$slug"
												params={{ slug: c.slug }}
												className="hover:underline"
											>
												{c.name}
											</Link>
										</CardTitle>
										<CardDescription>
											slug: <code>{c.slug}</code> · workspace:{" "}
											<code>{c.workspaceSlug}</code>
										</CardDescription>
									</div>
									<Button asChild variant="outline" size="sm">
										<Link to="/app/configs/$slug" params={{ slug: c.slug }}>
											Edit
										</Link>
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="text-xs text-[var(--color-muted-foreground)]">
									API key
								</div>
								<code className="block break-all rounded bg-[var(--color-muted)] px-2 py-1 text-xs">
									{c.apiKey}
								</code>
								<div className="text-xs text-[var(--color-muted-foreground)] pt-2">
									MCP endpoint
								</div>
								<div className="flex items-center gap-2">
									<code className="flex-1 break-all rounded bg-[var(--color-muted)] px-2 py-1 text-xs">
										{mcpUrl}
									</code>
									<Button
										variant="outline"
										size="icon"
										onClick={() => copy(mcpUrl, "MCP URL")}
										aria-label="Copy MCP URL"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
