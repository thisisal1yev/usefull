# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**usfull** — Telegram bot + Mini App for English/IELTS learners (speaking-partner matching, exam question bank, community Q&A, teacher sessions with Free/Premium/Gold tiers, Telegram Stars payments). Uzbek + English UI; MVP is IELTS-only (the `exam` enum already has `sat` for later).

The product spec and phase-by-phase implementation plans live in `docs/superpowers/specs/` and `docs/superpowers/plans/` **on disk only** — `docs/` is deliberately gitignored (client's request), so never rely on git history to recover them and never commit them. `.claude/` is gitignored too.

## Commands

The project uses **Bun** everywhere as package manager/script runner (`bun.lock`, no `package-lock.json`).

Server (`server/`, NestJS + Jest):

- `bun run dev` — watch mode (bot polls Telegram locally)
- `bun run test` / `bunx jest test/machine.spec.ts` — all tests / one file
- `bunx tsc --noEmit` — type-check
- `bun run build && bun run start` — production (webhook mode)

Webapp (`webapp/`, Vite + React + Tailwind v4 + Vitest):

- `bun run dev` — Vite dev server on :5173
- `bun run test` / `bunx vitest run src/screens/BankScreen.test.tsx` — all tests / one file
- `bun run build` — `tsc -b && vite build`

CI (`.github/workflows/ci.yml`) runs bun install → typecheck → tests on every push/PR.

Per-directory READMEs (`server/README.md`, `webapp/README.md`, `deploy/README.md`) document env vars, scripts and layout — keep them in sync when adding modules or env variables.

Secrets are in `server/.env` (gitignored): `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BOT_MODE` (`polling`|`webhook`), `PORT`, `WEBHOOK_SECRET`, `WEBAPP_URL`. Webapp env: `VITE_API_URL`.

## Architecture

NestJS (Express platform, CommonJS — no `.js` extensions in imports) + grammY + Supabase:

- **Config**: `src/config/configuration.ts` has a pure `loadConfig(env)`; the global `AppConfigModule` exposes the resolved `Config` under the `APP_CONFIG` DI token. Nothing reads `process.env` directly.
- **DB**: the global `DbModule` provides a `SupabaseClient<Database>` under the `SUPABASE` token, built with the service-role key. `src/db/types.ts` is **generated** from the live schema (Supabase MCP `generate_typescript_types`) — regenerate after every migration, don't hand-edit.
- **Domain logic is framework-free**: `src/onboarding/machine.ts` (state machine: lang → level → goal → availability → done) and `src/i18n/i18n.ts` (uz/en messages via `t(lang, key)`) have no Nest/grammY imports and carry the unit tests. Bot handlers in `src/bot/bot.service.ts` are thin wiring around them: every inline-keyboard callback uses the `ob:` prefix and goes through `applyInput`.
- **Bot lifecycle**: `BotService.onApplicationBootstrap` starts polling only when `BOT_MODE=polling`; in webhook mode `main.ts` mounts grammY's `webhookCallback` on `POST /webhook` with `secretToken`.
- **Mini App auth**: every `/api/*` endpoint sits behind `TelegramAuthGuard` — the webapp sends raw Telegram `initData` in the `x-telegram-init-data` header; `src/auth/init-data.ts` verifies the HMAC against `BOT_TOKEN` (max age 24 h) and the guard upserts the user onto `req.user`. API modules: `exam-questions` (bank; POST is teacher/admin only), `community` (Q&A), `users/me.controller`.
- **Data access rule**: the Mini App never talks to Supabase directly — only this server does, with the service-role key. All tables have RLS enabled with **no policies** (anon access denied by design). Tier limits and moderation are enforced server-side.
- **Schema**: `supabase/migrations/*.sql`, applied via Supabase MCP `apply_migration` (project id `ughjxpljxfqffzhbrozx`). Notable invariants: `users.tg_id` unique (Telegram identity), unique index on `bookings.slot_id` (double-booking guard), `unique (from_user, to_user)` on match_requests.
- **Webapp**: Tailwind v4 utilities only; colors via `tg-*` tokens mapped from Telegram theme variables in `webapp/src/styles.css`. Deployed on Vercel (https://usefull-fawn.vercel.app); server is deployed to a VPS via `deploy/` (Docker Compose + Caddy auto-HTTPS).

## Workflow preferences (client)

- Communicate with the user in Russian.
- Use context7 MCP for NestJS/grammY/supabase-js API reference; NestJS CLI (`nest g ...`) is installed — prefer it for generating modules/services/controllers.
- Implementation follows the plan docs task-by-task (TDD: failing test → implement → pass → commit); execution via parallel subagents where dependencies allow.
- Free-tier business rule to preserve everywhere: 1 free teacher session per **rolling 7 days** (Premium: 3/week, same rolling window); payment webhooks must be idempotent.
