/// <reference types="vite/client" />

import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appDir = fileURLToPath(new URL("./app", import.meta.url));

export default defineConfig({
	server: {
		port: 8788,
		strictPort: true,
		// Accept tunnels (cloudflared, ngrok) and any host in dev.
		allowedHosts: true,
	},
	resolve: {
		alias: {
			"~": appDir,
		},
	},
	plugins: [
		tailwindcss(),
		tanstackStart({ srcDirectory: "app" }),
		viteReact(),
		cloudflare({
			viteEnvironment: { name: "ssr" },
			// Avoid "More than one CF account" errors during local dev.
			remoteBindings: false,
		}),
	],
});
