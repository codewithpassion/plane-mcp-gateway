import { verifyToken } from "@clerk/backend";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Server function that verifies the caller is authenticated via Clerk.
 * Returns the Clerk userId, or throws a redirect to /sign-in.
 *
 * Token is taken from either:
 *  - the `Authorization: Bearer <token>` request header (when called from
 *    the client with a Clerk session token), or
 *  - the `__session` cookie (Clerk's default session cookie).
 */
export const requireAuthFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const req = getRequest();
		const headers = req.headers;
		const auth = headers.get("authorization");
		const cookieHeader = headers.get("cookie") ?? "";

		// `process.env` is provided by Cloudflare's nodejs_compat shim in the
		// Worker runtime. Vite SSR also exposes it.
		const env = (
			globalThis as unknown as {
				process?: { env: Record<string, string | undefined> };
			}
		).process?.env;
		const secretKey = env?.CLERK_SECRET_KEY;
		if (!secretKey) {
			throw new Error("CLERK_SECRET_KEY not configured");
		}

		let token: string | undefined;
		if (auth?.startsWith("Bearer ")) {
			token = auth.slice(7);
		} else {
			const match = /(?:^|; )__session=([^;]+)/.exec(cookieHeader);
			if (match) token = decodeURIComponent(match[1]);
		}

		if (!token) {
			throw redirect({ to: "/sign-in" });
		}

		try {
			const payload = await verifyToken(token, { secretKey });
			return { userId: payload.sub as string };
		} catch {
			throw redirect({ to: "/sign-in" });
		}
	},
);
