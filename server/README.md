# usfull server

NestJS backend for the usfull Telegram bot: onboarding dialog (grammY), user profiles in Supabase, health endpoint, webhook-ready bootstrap.

Runtime tooling: **Bun** (package manager / script runner), TypeScript strict, CommonJS modules, Jest.

## Quick start

```bash
bun install
cp .env.example .env   # then fill in the values
bun run dev            # NestJS watch mode, bot polls Telegram
```

## Environment variables (`.env`)

| Variable | Description |
|---|---|
| `BOT_TOKEN` | Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `SUPABASE_URL` | Supabase project URL (Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — server-side only, never ship to clients |
| `BOT_MODE` | `polling` (local dev) or `webhook` (production) |
| `PORT` | HTTP port, default `3000` |
| `WEBHOOK_SECRET` | Secret token for Telegram webhook validation (production) |

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start in watch mode |
| `bun run test` | Run all Jest tests |
| `bunx jest test/machine.spec.ts` | Run one test file |
| `bunx tsc --noEmit` | Type-check |
| `bun run build` / `bun run start` | Production build / run `dist/main.js` |

## Architecture

```
src/
├── config/       loadConfig() + global AppConfigModule (APP_CONFIG token)
├── db/           global DbModule (SUPABASE token → SupabaseClient<Database>), generated types.ts
├── users/        UsersService: upsertFromTelegram, completeOnboarding, getByTgId
├── onboarding/   pure state machine: lang → level → goal → availability → done
├── i18n/         t(lang, key), uz/en messages
├── bot/          BotService: grammY wiring (session, ob:* callbacks), polling on bootstrap
├── health/       GET /health → { ok: true }
├── app.module.ts
└── main.ts       webhook mode mounts grammY webhookCallback on POST /webhook
```

Rules of the codebase:

- Domain logic (`onboarding/`, `i18n/`) is framework-free and unit-tested; bot handlers are thin wiring.
- Config only via `@Inject(APP_CONFIG)` — nothing reads `process.env` directly.
- `src/db/types.ts` is generated from the live Supabase schema — regenerate after each migration, never edit by hand.
- Clients never talk to Supabase directly; RLS is enabled with no policies, this server uses the service-role key.

## Tests

Jest specs live in `test/*.spec.ts` (15 tests): config loading, i18n completeness, onboarding state machine, UsersService (mocked Supabase chain), health endpoint (supertest).

## Production webhook

```
bun run build && bun run start   # with BOT_MODE=webhook, WEBHOOK_SECRET set
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>/webhook&secret_token=<WEBHOOK_SECRET>
```
