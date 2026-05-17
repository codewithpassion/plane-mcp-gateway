import { UserButton, useAuth } from "@clerk/clerk-react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
	component: AppLayout,
});

function AppLayout() {
	const { isLoaded, isSignedIn } = useAuth();

	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			window.location.replace("/sign-in");
		}
	}, [isLoaded, isSignedIn]);

	if (!isLoaded || !isSignedIn) {
		return (
			<div className="flex h-screen items-center justify-center text-sm text-[var(--color-muted-foreground)]">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
			<header className="border-b border-[var(--color-border)]">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
					<Link to="/app/configs" className="text-base font-semibold">
						Plane MCP Gateway
					</Link>
					<UserButton afterSignOutUrl="/sign-in" />
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-6 py-8">
				<Outlet />
			</main>
		</div>
	);
}
