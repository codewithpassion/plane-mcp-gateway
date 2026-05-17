import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useApi } from "~/lib/api";

export const Route = createFileRoute("/app/configs/new")({
	component: NewConfig,
});

const schema = z.object({
	name: z.string().min(1, "Required"),
	slug: z
		.string()
		.min(1, "Required")
		.regex(/^[a-z0-9][a-z0-9-]*$/, "lowercase letters, digits, dashes"),
	baseUrl: z.string().url("Must be a URL"),
	workspaceSlug: z.string().min(1, "Required"),
	apiKey: z.string().min(1, "Required"),
	projectId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

function NewConfig() {
	const api = useApi();
	const navigate = useNavigate();
	const [values, setValues] = useState<FormValues>({
		name: "",
		slug: "",
		baseUrl: "https://api.plane.so",
		workspaceSlug: "",
		apiKey: "",
		projectId: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [submitting, setSubmitting] = useState(false);

	const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
		setValues((v) => ({ ...v, [key]: value }));

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsed = schema.safeParse(values);
		if (!parsed.success) {
			const next: FormErrors = {};
			for (const issue of parsed.error.issues) {
				const k = issue.path[0] as keyof FormValues;
				next[k] = issue.message;
			}
			setErrors(next);
			return;
		}
		setErrors({});
		setSubmitting(true);
		try {
			await api.createConfig({
				...parsed.data,
				projectId: parsed.data.projectId || undefined,
			});
			toast.success("Configuration created");
			await navigate({ to: "/app/configs" });
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>New configuration</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-4">
					<Field
						id="name"
						label="Name"
						value={values.name}
						error={errors.name}
						onChange={(v) => update("name", v)}
					/>
					<Field
						id="slug"
						label="Slug"
						value={values.slug}
						error={errors.slug}
						onChange={(v) => update("slug", v)}
						placeholder="my-workspace"
					/>
					<Field
						id="baseUrl"
						label="Plane base URL"
						value={values.baseUrl}
						error={errors.baseUrl}
						onChange={(v) => update("baseUrl", v)}
					/>
					<Field
						id="workspaceSlug"
						label="Workspace slug"
						value={values.workspaceSlug}
						error={errors.workspaceSlug}
						onChange={(v) => update("workspaceSlug", v)}
					/>
					<Field
						id="apiKey"
						label="API key"
						value={values.apiKey}
						error={errors.apiKey}
						onChange={(v) => update("apiKey", v)}
						type="password"
					/>
					<Field
						id="projectId"
						label="Default project ID (optional)"
						value={values.projectId ?? ""}
						error={errors.projectId}
						onChange={(v) => update("projectId", v)}
						placeholder="UUID (project picker coming in phase 3)"
					/>

					<div className="flex gap-2">
						<Button type="submit" disabled={submitting}>
							{submitting ? "Creating..." : "Create"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/app/configs" })}
						>
							Cancel
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
	error,
	onChange,
	type = "text",
	placeholder,
}: {
	id: string;
	label: string;
	value: string;
	error?: string;
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
			{error && (
				<div className="text-xs text-[var(--color-destructive)]">{error}</div>
			)}
		</div>
	);
}
