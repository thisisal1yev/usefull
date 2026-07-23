# usfull Launch Checklist

## Prerequisites (you provide)
- [ ] API subdomain (e.g. `api.usfull.uz`) → A-record to the VPS IP
- [ ] VPS with Docker + compose plugin; ports 80/443 open
- [ ] Fresh `BOT_TOKEN` from @BotFather (rotate the one used in dev)
- [ ] Decide Stars prices (`PREMIUM_STARS`, `GOLD_STARS`)

## Deploy
- [ ] `git push` all commits to GitHub
- [ ] On VPS: `git clone … && cd usefull/deploy && cp .env.example .env`
- [ ] Fill `deploy/.env`: `API_DOMAIN`, `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
      `BOT_MODE=webhook`, `WEBHOOK_SECRET` (`openssl rand -hex 32`), `WEBAPP_URL=https://usefull-fawn.vercel.app`,
      `PREMIUM_STARS`, `GOLD_STARS`
- [ ] `docker compose up -d --build`
- [ ] `docker compose ps` → both services healthy
- [ ] Register webhook:
      `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<API_DOMAIN>/webhook&secret_token=<WEBHOOK_SECRET>"`
- [ ] Vercel → project → env `VITE_API_URL=https://<API_DOMAIN>` → Redeploy

## Verify
- [ ] `curl https://<API_DOMAIN>/health` → `{"ok":true}`
- [ ] `getWebhookInfo` shows the URL, no `last_error_message`
- [ ] `/start` in the bot → onboarding works; Mini App opens from the menu button
- [ ] Mini App: partners, question bank, lessons all load
- [ ] Book a free lesson → second free booking blocked (weekly limit)
- [ ] Test purchase at a low Stars price → plan activates
- [ ] `/premium` in the bot → invoice appears

## First-run admin setup
- [ ] Set yourself admin: `update users set role='admin' where tg_id=<your_tg_id>;`
- [ ] Publish the first exam questions via the Admin tab
- [ ] Approve the first teacher applications
