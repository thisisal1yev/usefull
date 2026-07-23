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
| `PREMIUM_STARS` / `GOLD_STARS` | Subscription prices in Telegram Stars (defaults 350 / 1000) |
| `BOT_USERNAME` | Bot username without `@` — used to build referral invite links (`t.me/<BOT_USERNAME>?start=ref_<code>`) |

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
├── config/         loadConfig() + global AppConfigModule (APP_CONFIG token)
├── db/             global DbModule (SUPABASE token → SupabaseClient<Database>), generated types.ts
├── auth/           initData HMAC validation + TelegramAuthGuard
├── users/          UsersService: upsertFromTelegram, completeOnboarding, getByTgId, getById, listAdmins
├── onboarding/     pure state machine: lang → level → goal → availability → done
├── i18n/           t(lang, key) + tf(lang, key, vars), uz/en messages
├── bot/            BotService: grammY wiring (onboarding, /teacher, /premium, referral capture), polling on bootstrap
├── exam-questions/ IELTS question bank (teacher/admin publish)
├── community/      Q&A + moderation/ (reports, admin remove)
├── matches/        partner catalog + match requests
├── teachers/       TeachersService + pure apply-machine (shared by bot & lessons)
├── lessons/        teachers/slots/bookings/admin controllers + reminder cron
├── billing/        Stars invoices, idempotent payments, expiry cron
├── coach/          Gold coach assignment (admin)
├── referrals/      invite codes, reward tiers, summary
├── profile/        overview (streak, progress, lesson history) + pure computeStreak
├── health/         GET /health → { ok: true }
├── app.module.ts
└── main.ts         webhook mode mounts grammY webhookCallback on POST /webhook
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
| `GET /api/teachers` | Approved teachers with profiles |
| `POST /api/teachers/apply` | Apply as a teacher (also available via the bot's `/teacher` dialog) |
| `GET /api/teachers/me` | My teacher application/profile (or null) |
| `GET /api/teachers/:id/slots` | Teacher's free future slots |
| `POST /api/slots` | Create a 60-min slot `{ startsAt }` — approved teachers only |
| `GET /api/slots/mine` / `DELETE /api/slots/:id` | Manage own slots (delete only unbooked) |
| `POST /api/bookings` | Book a slot `{ slotId }` — free-tier limit: 1 per rolling 7 days (premium: 3) → 403 `weekly_limit`; busy slot → 409 |
| `GET /api/bookings` / `DELETE /api/bookings/:id` | My lessons / cancel (frees the slot, notifies the other side) |
| `GET /api/admin/teachers?status=` | Admin: list teacher applications |
| `POST /api/admin/teachers/:userId/status` | Admin: approve/reject (promotes role, notifies applicant) |
| `POST /api/billing/invoice` | Create a Telegram Stars invoice link `{ tier }` (XTR) for the Mini App |
| `GET /api/admin/gold` | Admin: Gold subscribers without a coach |
| `POST /api/admin/coach` | Admin: assign a coach `{ learnerId, coachUsername }` — notifies both sides |
| `POST /api/report` | Report a question/answer `{ targetType, targetId }` (duplicate is a no-op) |
| `GET /api/admin/reports` | Admin: reported questions/answers with report counts |
| `POST /api/admin/moderate` | Admin: remove reported content `{ targetType, targetId }` (soft `is_removed`) |
| `GET /api/partners?level=B1` | Partner catalog: onboarded users except self, optional level filter (no `tg_id` exposed) |
| `POST /api/matches` | Send a match request `{ toUserId }` — 409 on duplicate; notifies the target via the bot |
| `GET /api/matches` | `{ incoming, outgoing }` with embedded profiles |
| `POST /api/matches/:id/respond` | Recipient accepts/declines `{ accept }`; on accept both sides get each other's contact (`@username` or `tg://user?id=`) |
| `GET /api/referrals/me` | My referral summary: invite link, invited count, Premium days earned, reward tiers, invited list |
| `GET /api/profile` | Profile overview: `streak`, `progress { lessons, partners }`, `history` (past lessons) |

## Referrals

Each user gets a share link `t.me/<BOT_USERNAME>?start=ref_<code>`. When a **brand-new** user first `/start`s the bot via that link, the referrer is credited (`referrals.invited_id` is unique, so each person counts once; self-referral and existing users don't count). Reward tiers grant Premium days once each: 2 friends → 1 day, 5 → 7, 10 → 30, 20 → 90 (`users.ref_rewarded_count` guards against re-granting). Days extend the plan from `max(now, current expiry)` and never downgrade an existing tier.

## Profile overview

`GET /api/profile` derives everything from existing tables (no new schema). **Streak** = consecutive days ending today or yesterday (grace) on which the user either booked a lesson or got an accepted match; dates are UTC. **Progress** counts total bookings and accepted matches. **History** lists past lessons (slot `starts_at` < now); off-platform partner calls are not tracked.

## Tests

Jest specs live in `test/*.spec.ts` (24 suites, 93 tests): config, i18n, onboarding + teacher-apply state machines, `computeStreak`, initData validation, and every service/controller with a mocked Supabase chain (users, exam-questions, community, moderation, matches, teachers, bookings, billing, coach, referrals, profile) plus the health endpoint (supertest). Run one file with `bunx jest test/streak.spec.ts`.

## Reminders & billing cron

`RemindersService` (`@nestjs/schedule`, cron every 10 min) sends lesson reminders to both sides when a booking enters the 24-hour and 1-hour windows; `bookings.reminded_24h` / `reminded_1h` flags guarantee each fires once.

`BillingCronService` (hourly) downgrades expired plans to `free` and notifies the user. Payments are **idempotent**: `subscriptions.stars_tx_id` is unique, so a re-delivered `successful_payment` neither duplicates the subscription nor extends the plan twice. Purchase works both from the bot (`/premium`) and the Mini App (`POST /api/billing/invoice` → `tg.openInvoice`).

## Smoke test

`bun run smoke` signs a Telegram `initData` with `BOT_TOKEN` and hits the running server's health + main GET endpoints, exiting non-zero on any unexpected status. Point it elsewhere with `SMOKE_BASE=https://api.example.uz bun run smoke`. Handy right after a deploy.

## Production webhook

```
bun run build && bun run start   # with BOT_MODE=webhook, WEBHOOK_SECRET set
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>/webhook&secret_token=<WEBHOOK_SECRET>
```
