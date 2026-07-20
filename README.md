# usfull — IELTS speaking partners & teachers (Telegram bot + Mini App)

**usfull** is a Telegram-based language-learning product for English / IELTS preparation:

- 🗣 **Speaking-partner matching** — browse profiles, send a request, get connected on mutual accept
- 📋 **Latest exam question bank** — fresh IELTS Speaking questions (Part 1/2/3) published by teachers/admins
- 💬 **Community Q&A** — ask language questions, answer others, newest first
- 👩‍🏫 **Teacher sessions** — 1 free session per rolling 7 days; more on **Premium**
- ⭐ **Gold** — everything in Premium plus a personal support coach

Stack: **NestJS** (Express platform) + **grammY** + **Supabase** (Postgres, RLS on). Payments: **Telegram Stars**. UI languages: **uz / en**.

## Setup

1. `cd server && bun install` (project uses [Bun](https://bun.sh) as package manager/runner)
2. Copy `.env.example` → `.env`, fill in:
   - `BOT_TOKEN` — from [@BotFather](https://t.me/BotFather)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase project → Settings → API
   - `BOT_MODE` — `polling` for local dev, `webhook` for production
   - `WEBHOOK_SECRET` — any random string (production only)
3. Apply `supabase/migrations/0001_init.sql` to the Supabase project (SQL Editor), if not already applied.

## Run

- Dev: `bun run dev`
- Tests: `bun run test`
- Production: `bun run build && bun run start`, then register the webhook:
  `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>/webhook&secret_token=<WEBHOOK_SECRET>`

## Structure

- `server/src/config` — env config (`APP_CONFIG` provider)
- `server/src/db` — Supabase client provider + generated DB types
- `server/src/users` — `UsersService` (profiles, onboarding)
- `server/src/bot` — grammY bot (onboarding dialog)
- `server/src/health` — health endpoint
- `supabase/migrations` — SQL schema

## Roadmap (MVP phases)

1. ✅ Bot skeleton, DB schema, onboarding
2. Mini App: question bank + community Q&A
3. Partner matching
4. Teachers, slots, booking, free-tier limit
5. Telegram Stars payments, Premium/Gold, coach
6. Testing & launch
