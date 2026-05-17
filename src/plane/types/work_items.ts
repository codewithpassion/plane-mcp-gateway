import type { PaginatedResponse, PlaneResource } from "./common";

export type WorkItem = PlaneResource;
export type WorkItemDetail = PlaneResource;
export type WorkItemSearch = PlaneResource;
export type AdvancedSearchResult = PlaneResource;
export type PaginatedWorkItemResponse = PaginatedResponse<WorkItem>;
