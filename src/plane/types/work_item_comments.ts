import type { PaginatedResponse, PlaneResource } from "./common";

export type WorkItemComment = PlaneResource;
export type PaginatedWorkItemCommentResponse =
	PaginatedResponse<WorkItemComment>;
