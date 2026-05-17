import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type PlaneConfigRecord, useApi } from "~/lib/api";

export const Route = createFileRoute("/app/configs/$slug")({
	component: EditConfig,
});

const schema = z.object({
	name: z.string().min(1),
	baseUrl: z.string().url(),
	workspaceSlug: z.string().min(1),
	apiKey: z.string().optional(),
	projectId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function EditConfig() {
	const { slug } = Route.useParams();
	const api = useApi();
	const navigate = useNavigate();
	const [record, setRecord] = useState<PlaneConfigRecord | null>(null);
	const [values, setValues] = useState<FormValues | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		api
			.getConfig(slug)
			.then((r) => {
				if (!active) return;
				setRecord(r);
				setValues({
					name: r.name,
					baseUrl: r.baseUrl,
					workspaceSlug: r.workspaceSlug,
					apiKey: "",
					projectId: r.projectId ?? "",
				});
			})
			.catch((e: Error) => {
				if (active) setError(e.message);
			});
		return () => {
			active = false;
		};
	}, [api, slug]);

	if (error)
		return (
			<Card>
				<CardContent className="pt-6 text-sm text-[var(--color-destructive)]">
					{error}
				</CardContent>
			</Card>
		);
	if (!values || !record)
		return (
			<div className="text-sm text-[var(--color-muted-foreground)]">
				Loading...
			</div>
		);

	const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
		setValues((v) => (v ? { ...v, [key]: value } : v));

	const onSave = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = schema.safeParse(values);
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
			return;
		}
		setBusy(true);
		try {
			const patch = {
				name: parsed.data.name,
				baseUrl: parsed.data.baseUrl,
				workspaceSlug: parsed.data.workspaceSlug,
				projectId: parsed.data.projectId || undefined,
				...(parsed.data.apiKey ? { apiKey: parsed.data.apiKey } : {}),
			};
			await api.updateConfig(slug, patch);
			toast.success("Saved");
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setBusy(false);
		}
	};

	const onDelete = async () => {
		if (!confirm(`Delete configuration "${record.name}"?`)) return;
		setBusy(true);
		try {
			await api.deleteConfig(slug);
			toast.success("Deleted");
			await navigate({ to: "/app/configs" });
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setBusy(false);
		}
	};

	const onTest = async () => {
		setBusy(true);
		try {
			const r = await api.testConnection(slug);
			if (r.ok) toast.success("Connection OK");
			else toast.error(r.error ?? "Connection failed");
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit "{record.name}"</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSave} className="space-y-4">
					<Field
						id="name"
						label="Name"
						value={values.name}
						onChange={(v) => update("name", v)}
					/>
					<Field
						id="baseUrl"
						label="Plane base URL"
						value={values.baseUrl}
						onChange={(v) => update("baseUrl", v)}
					/>
					<Field
						id="workspaceSlug"
						label="Workspace slug"
						value={values.workspaceSlug}
						onChange={(v) => update("workspaceSlug", v)}
					/>
					<Field
						id="apiKey"
						label="API key (leave blank to keep existing)"
						value={values.apiKey ?? ""}
						type="password"
						onChange={(v) => update("apiKey", v)}
						placeholder={record.apiKey}
					/>
					<Field
						id="projectId"
						label="Default project ID"
						value={values.projectId ?? ""}
						onChange={(v) => update("projectId", v)}
						placeholder="UUID"
					/>

					<div className="flex flex-wrap gap-2 pt-2">
						<Button type="submit" disabled={busy}>
							Save
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onTest}
							disabled={busy}
						>
							Test connection
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={onDelete}
							disabled={busy}
						>
							Delete
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => navigate({ to: "/app/configs" })}
						>
							Back
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

function Field({
	id,
	label,
	value,
	onChange,
	type = "text",
	placeholder,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (v: string) => void;
	type?: string;
	placeholder?: string;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
