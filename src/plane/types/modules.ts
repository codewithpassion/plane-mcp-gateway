import type { PaginatedResponse, PlaneResource } from "./common";

export type Module = PlaneResource;
export type ModuleWorkItem = PlaneResource;
export type PaginatedModuleResponse = PaginatedResponse<Module>;
export type PaginatedArchivedModuleResponse = PaginatedResponse<Module>;
export type PaginatedModuleWorkItemResponse = PaginatedResponse<ModuleWorkItem>;
