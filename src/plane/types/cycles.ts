import type { PaginatedResponse, PlaneResource } from "./common";

export type Cycle = PlaneResource;
export type CycleWorkItem = PlaneResource;
export type PaginatedCycleResponse = PaginatedResponse<Cycle>;
export type PaginatedArchivedCycleResponse = PaginatedResponse<Cycle>;
export type PaginatedCycleWorkItemResponse = PaginatedResponse<CycleWorkItem>;
