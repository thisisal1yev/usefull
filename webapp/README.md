# usfull webapp

Telegram Mini App for usfull: IELTS question bank + community Q&A (partner matching arrives in phase 3).

Stack: **Vite + React 18 + TypeScript**, **Tailwind CSS v4** (via `@tailwindcss/vite`), Vitest + Testing Library. Deployed on Vercel: https://usefull-fawn.vercel.app

## Quick start

```bash
bun install
cp .env.example .env    # VITE_API_URL=http://localhost:3000 for local dev
bun run dev             # http://localhost:5173
```

Outside Telegram the UI opens, but API calls return 401 — authentication requires real Telegram `initData` (open through the bot's Mini App button for a full e2e).

## Environment

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the usfull server (no trailing slash). On Vercel set it to the public API domain. |

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Vite dev server |
| `bun run test` | Vitest (jsdom, shared setup in `src/test-setup.ts`) |
| `bunx vitest run src/screens/BankScreen.test.tsx` | One test file |
| `bun run build` | `tsc -b && vite build` → `dist/` |

## Structure

```
src/
├── telegram.ts    lazy wrapper over window.Telegram.WebApp (initData, theme)
├── api.ts         api<T>(path, init) — fetch with x-telegram-init-data header
├── styles.css     Tailwind v4 entry + Telegram theme tokens (@theme inline)
├── App.tsx        tab bar + screen switch
└── screens/       BankScreen (question bank), QaScreen (community Q&A)
```

## Styling rules

- Tailwind utilities only; colors go through the `tg-*` tokens mapped from Telegram theme variables in `styles.css` (`bg-tg-bg`, `text-tg-text`, `text-tg-hint`, `text-tg-link`, `bg-tg-button`, `text-tg-button-text`, `bg-tg-secondary`). Fallback values keep the app usable in a plain browser.
- Never talk to Supabase directly — all data goes through the server's `/api/*`.
