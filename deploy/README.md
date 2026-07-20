# Deploying usfull to a VPS (Docker + Caddy)

One `docker compose` stack: the NestJS server (bot in webhook mode + Mini App API) behind Caddy with automatic HTTPS.

## Prerequisites

- VPS with Docker and the compose plugin (`docker compose version`)
- DNS A-record for the API subdomain (e.g. `api.your-domain.uz`) pointing to the VPS IP
- Ports 80 and 443 open

## Steps

```bash
# on the VPS
git clone https://github.com/thisisal1yev/usefull.git
cd usefull/deploy
cp .env.example .env
nano .env          # fill in every value; WEBHOOK_SECRET: openssl rand -hex 32
docker compose up -d --build
docker compose logs -f server   # wait for "bot mode: webhook"
```

Register the Telegram webhook (once, from anywhere):

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<API_DOMAIN>/webhook&secret_token=<WEBHOOK_SECRET>"
```

Verify:

```bash
curl https://<API_DOMAIN>/health          # {"ok":true}
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## Connecting the Mini App

1. In Vercel, set the `VITE_API_URL` env var of the webapp project to `https://<API_DOMAIN>` and redeploy.
2. Put the Vercel URL into `WEBAPP_URL` in `deploy/.env`, then `docker compose up -d` again — the bot installs the menu button and shows the "open app" button after onboarding.

## Updating

```bash
cd usefull && git pull
cd deploy && docker compose up -d --build
```
