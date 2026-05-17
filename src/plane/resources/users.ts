import { type PlaneConfig, planeFetch } from "../client";
import type { UserLite } from "../types/users";

export async function getMe(cfg: PlaneConfig): Promise<UserLite> {
	return planeFetch<UserLite>(cfg, "GET", "users/me");
}
