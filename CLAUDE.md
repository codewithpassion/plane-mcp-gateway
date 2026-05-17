# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

A multi-tenant Plane MCP gateway on Cloudflare Workers. Sign-in via Clerk, per-user
KV-stored Plane configurations, one MCP endpoint per slug:
`https://<host>/mcp/<slug>`.

## Top-level dispatch (`src/server.ts`)

`src/server.ts` is the Worker entry (`main` in `wrangler.jsonc`). It routes by URL:

- `/(mcp|sse)/<slug>(/...)?` — rewrite path to `/mcp` or `/sse`, set the
  `X-Plane-Config-Slug` header, then forward to `OAuthProvider.fetch`.
- `/authorize`, `/callback`, `/register`, `/token`, `/.well-known/*` — straight to
  `OAuthProvider.fetch` (wrapped to HTTPS-rewrite OAuth metadata URLs and to enrich
  401 responses with `resource_metadata` per RFC 9728).
- `/api/*` — Hono app (`src/api/index.ts`), gated by Clerk
  `authenticateRequest` middleware.
- everything else — TanStack Start UI (`app/`).

## Layers

### OAuth (Clerk as IdP)

`src/clerk-handler.ts`, `src/workers-oauth-utils.ts` — unchanged from the original
boilerplate. The OAuth token's `props` field carries `{ userId, sessionId, email,
firstName, lastName, role, metadata }` (`src/utils.ts`).

### Storage

`src/plane/storage.ts` — `PlaneConfigRecord` lives in `OAUTH_KV` under
`plane:cfg:<userId>:<slug>`. `validateSlug()` enforces a regex + a reserved-word
list (`well-known`, `mcp`, `sse`, `api`, `app`, …). `redactApiKey()` returns
`••••<last4>` for API responses.

### JSON API (`src/api/index.ts`)

Hono mounted at `/api`. Clerk session middleware. Endpoints:
- `GET/POST /configs`
- `GET/PATCH/DELETE /configs/:slug`
- `POST /configs/:slug/test` → `GET workspaces/<workspaceSlug>` against Plane
- `GET /configs/:slug/projects` → project picker source
- `POST /configs/projects-preview` → same as above, but takes raw credentials so the
  create form can list projects before the config is saved.

`apiKey` is always redacted on read; zod validation on writes.

### MCP (`src/mcp/mcp-app.ts`)

`MyMCP` extends `McpAgent`.

- `init()` registers a `_bootstrap` stub tool BEFORE the transport connects. This is
  required so the SDK wires up `tools/list` / `tools/call` capability handlers at
  initialize time; once the transport is connected you can only add/remove tools
  (and have `list_changed` fire automatically), not register the capability for the
  first time. Without the stub you get
  `Error: Cannot register capabilities after connecting to transport`.
- `fetch()` reads the slug from `X-Plane-Config-Slug` and seals the DO to that slug
  on first request (mismatch → 400). It then loads the config from KV. Missing
  config (post-auth) → HTTP 410.
- On every request, the config's `updatedAt` is compared against the last applied
  version. On change, `applyConfig()` removes all previously registered tools,
  fetches workspace + project list, recomputes the `instructions` text (workspace
  name, workspace URL, project table, URL patterns), mutates
  `server.server.instructions`, logs the full instructions, and re-runs
  `registerPlaneTools`. `notifications/tools/list_changed` fires automatically as a
  side effect of `.remove()` + new `.tool()` calls.
- KV is eventually consistent (~60s cross-colo), so propagation is bounded by that.

### Plane client + tools (`src/plane/`)

- `client.ts` — `planeFetch(config, method, path, {params?, body?})` with
  retry/backoff (3 retries, exponential backoff on 429/5xx for idempotent methods).
- `resources/*.ts` — one async function per Plane endpoint.
- `tools/*.ts` — `register*Tools(server, ctx)` per resource. Tool names and
  parameter names match the Python `plane-mcp-server` VERBATIM (snake_case).
- `tools/_helpers.ts` — `toolResult(fn)` (errors → `isError`), `stripNullish(obj)`
  (mirrors pydantic `exclude_none`), `projectIdField(ctx)` and
  `requireProjectId(ctx, args)` for project pinning.
- `tools/_web_url.ts` — `withWebUrl(ctx, kind, value, defaultProjectId?)` attaches
  a `web_url` field to project/work-item/cycle/module/page results.
- `tools/index.ts` — `registerPlaneTools(server, ctx)` calls every
  `register*Tools`.

### UI (`app/`)

TanStack Start (file-based routes) + shadcn/ui + Tailwind v4. Clerk via
`@clerk/clerk-react`. Routes:
- `__root.tsx` — `ClerkProvider` + `Toaster`
- `index.tsx` — redirect by auth state
- `sign-in.tsx` — Clerk `<SignIn/>`
- `app/route.tsx` — auth gate + `<UserButton/>`
- `app/configs/{index,new,$slug}.tsx` — list / create / edit + delete + test

`vite.config.ts` pins port 8788 and disables remote bindings. The Worker's
fallback handler dynamically imports `app/server-entry` when present.

## Project pinning

Set `projectId` on a `PlaneConfigRecord` to pin the config to a single project.
`projectIdField(ctx)` then returns `{}`, so the `project_id` parameter disappears
from every project-scoped tool's schema. `requireProjectId(ctx, args)` resolves
the id at call time (pinned wins). `list_projects`, `create_project`, and
`delete_project` are NOT registered when pinned.

## Gotchas

- **Slug-sealed DO**: a Durable Object handles one slug for its lifetime. Mixing
  slugs on the same session returns 400.
- **`/work-items/` not `/issues/`**: the Plane Python SDK uses the hyphenated form.
  Trust the SDK paths over the Plane API docs.
- **planeFetch path rules**: NO leading `/api/v1/`, NO trailing slash. The client
  adds both. E.g. `workspaces/${ws}/projects/${pid}/work-items/${id}`.
- **POST/PATCH bodies** must pass through `stripNullish()` first — Plane rejects
  null/undefined for many optional fields.
- **KV staleness**: tool list refresh latency is bounded by KV's eventual
  consistency (~60s cross-colo).
- **SSE vs Streamable-HTTP**: `/sse/<slug>` is deprecated; new clients should use
  `/mcp/<slug>`.

## Common commands

```bash
bun install
bun run dev           # localhost:8788
bun run type-check    # root + app
bun run lint
bun run deploy
```

Secrets to set in production: `CLERK_CLIENT_ID`, `CLERK_CLIENT_SECRET`,
`CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_FRONTEND_API`,
`COOKIE_ENCRYPTION_KEY`.
