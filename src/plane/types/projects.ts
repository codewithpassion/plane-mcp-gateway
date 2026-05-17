import type { PaginatedResponse, PlaneResource } from "./common";

export type Project = PlaneResource;
export type ProjectFeature = PlaneResource;
export type ProjectWorklogSummary = PlaneResource;
export type ProjectMember = PlaneResource;
export type PaginatedProjectResponse = PaginatedResponse<Project>;
