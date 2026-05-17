export type PlaneResource = { [key: string]: unknown };

export interface PaginatedResponse<T = PlaneResource> {
	results: T[];
	next_cursor?: string | null;
	prev_cursor?: string | null;
	total_count?: number;
	total_pages?: number;
	count?: number;
	[key: string]: unknown;
}
