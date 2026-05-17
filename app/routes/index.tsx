import { useAuth } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

/**
 * Client-side gate. Clerk auth state lives in the browser; once Clerk
 * has loaded we forward to /app/configs or /sign-in. Server-side session
 * verification (via `requireAuthFn`) is available for routes that need it.
 */
function IndexComponent() {
	const { isLoaded, isSignedIn } = useAuth();

	useEffect(() => {
		if (!isLoaded) return;
		window.location.replace(isSignedIn ? "/app/configs" : "/sign-in");
	}, [isLoaded, isSignedIn]);

	return (
		<div className="flex h-screen items-center justify-center text-sm text-[var(--color-muted-foreground)]">
			Loading...
		</div>
	);
}
