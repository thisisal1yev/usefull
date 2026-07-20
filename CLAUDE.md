# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**usfull** — Telegram bot + Mini App for English/IELTS learners (speaking-partner matching, exam question bank, community Q&A, teacher sessions with Free/Premium/Gold tiers, Telegram Stars payments). Uzbek + English UI; MVP is IELTS-only (the `exam` enum already has `sat` for later).

The product spec and phase-by-phase implementation plans live in `docs/superpowers/specs/` and `docs/superpowers/plans/` **on disk only** — `docs/` is deliberately gitignored (client's request), so never rely on git history to recover them and never commit them. `.claude/` is gitignored too.

## Commands

All server work happens in `server/`:

- `npm run dev` — start NestJS in watch mode (bot runs in polling mode locally)
- `npm test` — run all Jest tests
- `npx jest test/machine.spec.ts` — run a single test file
- `npx tsc --noEmit` — type-check without building
- `npm run build && npm start` — production build/run (webhook mode)

Secrets are in `server/.env` (gitignored): `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BOT_MODE` (`polling`|`webhook`), `PORT`, `WEBHOOK_SECRET`.

## Architecture

NestJS (Express platform, CommonJS — no `.js` extensions in imports) + grammY + Supabase:

- **Config**: `src/config/configuration.ts` has a pure `loadConfig(env)`; the global `AppConfigModule` exposes the resolved `Config` under the `APP_CONFIG` DI token. Nothing reads `process.env` directly.
- **DB**: the global `DbModule` provides a `SupabaseClient<Database>` under the `SUPABASE` token, built with the service-role key. `src/db/types.ts` is **generated** from the live schema (Supabase MCP `generate_typescript_types`) — regenerate after every migration, don't hand-edit.
- **Domain logic is framework-free**: `src/onboarding/machine.ts` (state machine: lang → level → goal → availability → done) and `src/i18n/i18n.ts` (uz/en messages via `t(lang, key)`) have no Nest/grammY imports and carry the unit tests. Bot handlers in `src/bot/bot.service.ts` are thin wiring around them: every inline-keyboard callback uses the `ob:` prefix and goes through `applyInput`.
- **Bot lifecycle**: `BotService.onApplicationBootstrap` starts polling only when `BOT_MODE=polling`; in webhook mode `main.ts` mounts grammY's `webhookCallback` on `POST /webhook` with `secretToken`.
- **Data access rule**: clients (future Mini App) never talk to Supabase directly — only this server does, with the service-role key. All tables have RLS enabled with **no policies** (anon access denied by design). Tier limits and moderation are enforced server-side.
- **Schema**: `supabase/migrations/*.sql`, applied via Supabase MCP `apply_migration` (project id `ughjxpljxfqffzhbrozx`). Notable invariants: `users.tg_id` unique (Telegram identity), unique index on `bookings.slot_id` (double-booking guard), `unique (from_user, to_user)` on match_requests.

## Workflow preferences (client)

- Communicate with the user in Russian.
- Use context7 MCP for NestJS/grammY/supabase-js API reference; NestJS CLI (`nest g ...`) is installed — prefer it for generating modules/services/controllers.
- Implementation follows the plan docs task-by-task (TDD: failing test → implement → pass → commit); execution via parallel subagents where dependencies allow.
- Free-tier business rule to preserve everywhere: 1 free teacher session per **rolling 7 days** (Premium: 3/week, same rolling window); payment webhooks must be idempotent.
