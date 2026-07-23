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

## Behind an existing reverse proxy (shared VPS)

If the VPS already runs another production app whose nginx/Caddy/Traefik owns
ports 80/443, **do not** use the default compose (its Caddy would fight for
those ports). Instead run only the usfull server on a loopback port and route
to it from your existing proxy.

1. DNS: add `api.yourdomain` → the VPS IP (a subdomain is independent of the
   root and the other product; if you already have a wildcard, skip this).
2. Start only the server:
   ```bash
   cd usefull/deploy && cp .env.example .env && nano .env   # BOT_MODE=webhook, SERVER_PORT=3001
   docker compose -f docker-compose.behind-proxy.yml up -d --build
   curl http://127.0.0.1:3001/health   # {"ok":true}
   ```
3. Add a vhost for `api.yourdomain` to your existing proxy → `127.0.0.1:3001`.

   **nginx** (new server block, then `certbot --nginx -d api.yourdomain`):
   ```nginx
   server {
       listen 443 ssl;
       server_name api.yourdomain;
       # ssl_certificate / ssl_certificate_key managed by certbot
       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   **Caddy** (add to the existing Caddyfile — auto HTTPS):
   ```
   api.yourdomain {
       reverse_proxy 127.0.0.1:3001
   }
   ```

4. Register the webhook and set Vercel's `VITE_API_URL` to `https://api.yourdomain`
   exactly as in the checklist above. The server enables permissive CORS, so the
   Vercel Mini App can call it.

## Updating

```bash
cd usefull && git pull
cd deploy && docker compose up -d --build            # default (own Caddy)
# or, behind an existing proxy:
cd deploy && docker compose -f docker-compose.behind-proxy.yml up -d --build
```
