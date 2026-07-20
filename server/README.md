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
| `WEBAPP_URL` | Optional HTTPS URL of the deployed Mini App; when set the bot installs a `web_app` menu button and adds an "open app" button after onboarding |

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

## Mini App API (`/api/*`)

All `/api/*` endpoints are protected by `TelegramAuthGuard`: the client (the Mini App) must send the raw Telegram Web App `initData` string in the `x-telegram-init-data` header. The guard verifies the HMAC signature against `BOT_TOKEN` (max age 24 h), upserts the user, and puts the `users` row on `req.user`.

| Endpoint | Description |
|---|---|
| `GET /api/me` | Current user's `users` row |
| `GET /api/exam-questions?part=Part 1` | Question bank, newest first (max 50), optional part filter |
| `POST /api/exam-questions` | Publish a bank question — `teacher`/`admin` roles only |
| `GET /api/questions` | Community Q&A feed, newest first, removed content excluded |
| `POST /api/questions` | Ask a community question `{ body }` |
| `GET /api/questions/:id/answers` | Answers for a question |
| `POST /api/questions/:id/answers` | Answer a question `{ body }` |
| `GET /api/partners?level=B1` | Partner catalog: onboarded users except self, optional level filter (no `tg_id` exposed) |
| `POST /api/matches` | Send a match request `{ toUserId }` — 409 on duplicate; notifies the target via the bot |
| `GET /api/matches` | `{ incoming, outgoing }` with embedded profiles |
| `POST /api/matches/:id/respond` | Recipient accepts/declines `{ accept }`; on accept both sides get each other's contact (`@username` or `tg://user?id=`) |

## Tests

Jest specs live in `test/*.spec.ts` (29 tests): config loading, i18n completeness, onboarding state machine, UsersService / ExamQuestionsService / CommunityService (mocked Supabase chain), initData validation, `/api/me` controller, health endpoint (supertest).

## Production webhook

```
bun run build && bun run start   # with BOT_MODE=webhook, WEBHOOK_SECRET set
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>/webhook&secret_token=<WEBHOOK_SECRET>
```
