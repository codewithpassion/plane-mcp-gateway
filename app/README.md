# app/ — TanStack Start UI

Web UI for the Plane MCP Gateway. Lives alongside the Worker (`src/`)
and is served by the same origin via `@cloudflare/vite-plugin` +
`@tanstack/react-start`.

## Layout

```
app/
  routes/
    __root.tsx              # ClerkProvider + Toaster shell
    index.tsx               # / -> /app/configs or /sign-in
    sign-in.tsx             # Clerk <SignIn />
    app/
      route.tsx             # auth gate + top nav
      configs/
        index.tsx           # list + per-config MCP URL
        new.tsx             # create form
        $slug.tsx           # edit / delete / test connection
  lib/
    api.ts                  # typed /api/configs* client (Clerk-aware)
    auth.ts                 # requireAuthFn server fn (Clerk JWT verify)
    utils.ts                # cn()
  components/ui/            # shadcn-style primitives
  styles/app.css            # Tailwind v4 zero-config import
  tsconfig.json             # DOM/React-typed; included by `type-check`
  routeTree.gen.ts          # generated on first dev/build (placeholder)
```

## Choices / caveats

- **Auth gating is client-side** (Clerk's React SDK). `requireAuthFn`
  exists for server-fn calls but routes use `useAuth()` + redirect
  rather than blocking SSR. Reason: Clerk session lives in browser
  cookies/storage; full SSR-session integration is out of scope for the
  scaffold. The `/api/*` worker routes will verify the Bearer token
  server-side, which is what actually protects data.
- **`routeTree.gen.ts`** is committed as an empty placeholder so
  `bun run type-check` passes before the dev server has run.
  `vite dev` (or `vite build`) regenerates it.
- **Two tsconfigs.** Root `tsconfig.json` covers `src/` (Workers runtime
  types only); `app/tsconfig.json` covers the UI (DOM + React types).
  The root `type-check` script now runs both.
- **shadcn primitives** are hand-written rather than scaffolded via
  `bunx shadcn@latest init` — the CLI doesn't detect TanStack Start
  cleanly. Tailwind v4 zero-config (`@import "tailwindcss";`) keeps it
  light.
- **`remoteBindings: false`** on the Cloudflare Vite plugin avoids the
  "More than one CF account" error during local dev.
- **`VITE_CLERK_PUBLISHABLE_KEY`** must be set in `.env` for the UI to
  boot. Backend already requires `CLERK_SECRET_KEY` etc.
