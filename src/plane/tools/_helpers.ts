import { PlaneError } from "../errors";

export interface ToolTextResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
	[key: string]: unknown;
}

export async function toolResult<T>(
	fn: () => Promise<T>,
): Promise<ToolTextResult> {
	try {
		const result = await fn();
		const text =
			result === undefined || result === null
				? "(no content)"
				: typeof result === "string"
					? result
					: JSON.stringify(result, null, 2);
		return { content: [{ type: "text", text }] };
	} catch (err) {
		const message =
			err instanceof PlaneError
				? `${err.name}: ${err.message}${
						"payload" in err && (err as unknown as { payload: unknown }).payload
							? `\n${JSON.stringify((err as unknown as { payload: unknown }).payload, null, 2)}`
							: ""
					}`
				: err instanceof Error
					? err.message
					: String(err);
		return { content: [{ type: "text", text: message }], isError: true };
	}
}

export function stripNullish<T extends Record<string, unknown>>(
	obj: T,
): Partial<T> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(obj)) {
		if (v !== undefined && v !== null) out[k] = v;
	}
	return out as Partial<T>;
}
