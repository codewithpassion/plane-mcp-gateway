import type { PaginatedResponse, PlaneResource } from "./common";

export type Milestone = PlaneResource;
export type MilestoneWorkItem = PlaneResource;
export type PaginatedMilestoneResponse = PaginatedResponse<Milestone>;
export type PaginatedMilestoneWorkItemResponse =
	PaginatedResponse<MilestoneWorkItem>;
