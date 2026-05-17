/**
 * Bindings set via `wrangler secret put` are not visible to
 * `wrangler types`, so declare them here so they are accessible on the
 * `Env` type used by both the request-scoped handler `c.env` AND the
 * top-level `env` import from `cloudflare:workers`.
 */
declare namespace Cloudflare {
	interface Env {
		CLERK_CLIENT_ID: string;
		CLERK_CLIENT_SECRET: string;
		CLERK_SECRET_KEY: string;
		CLERK_PUBLISHABLE_KEY: string;
		CLERK_FRONTEND_API: string;
		COOKIE_ENCRYPTION_KEY: string;
	}
}
