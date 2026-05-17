/// <reference types="vite/client" />

import { ClerkProvider } from "@clerk/clerk-react";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type * as React from "react";
import { Toaster } from "sonner";
import appCss from "~/styles/app.css?url";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "Plane MCP Gateway" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{publishableKey ? (
					<ClerkProvider publishableKey={publishableKey}>
						{children}
						<Toaster richColors position="top-right" />
					</ClerkProvider>
				) : (
					<div style={{ padding: 32, fontFamily: "system-ui" }}>
						<h1>Missing VITE_CLERK_PUBLISHABLE_KEY</h1>
						<p>
							Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to your environment
							and restart the dev server.
						</p>
					</div>
				)}
				<Scripts />
			</body>
		</html>
	);
}
