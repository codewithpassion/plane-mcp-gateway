/// <reference types="vite/client" />

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 8788,
		strictPort: true,
	},
	plugins: [
		cloudflare({
			viteEnvironment: { name: "ssr" },
			// Avoid "More than one CF account" errors during local dev.
			remoteBindings: false,
		}),
		tailwindcss(),
		tanstackStart({
			srcDirectory: "app",
			router: {
				routesDirectory: "app/routes",
				generatedRouteTree: "app/routeTree.gen.ts",
			},
		}),
		viteReact(),
	],
});
