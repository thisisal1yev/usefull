# usfull webapp

Telegram Mini App for usfull: speaking-partner matching, IELTS question bank, referrals, and profile — a four-tab app in a committed dark brand look.

Stack: **Vite + React 18 + TypeScript**, **Tailwind CSS v4** (via `@tailwindcss/vite`), **lucide-react** icons, Vitest + Testing Library. Deployed on Vercel: https://usefull-fawn.vercel.app

## Quick start

```bash
bun install
cp .env.example .env    # VITE_API_URL=http://localhost:3000 for local dev
bun run dev             # http://localhost:5173
```

Outside Telegram the UI opens but API calls return 401 — auth needs real Telegram `initData` (open through the bot's Mini App button for a full e2e). On Vercel the data screens stay on "loading" until `VITE_API_URL` points at a reachable server.

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

## Navigation (4 tabs + admin)

Bottom tab bar with lucide icons: **speaking · bank · invite · profile** (+ **admin**, shown only when `/api/me` reports an admin role).

- **speaking** — partner catalog + match requests folded into one screen (a Partners / Requests segment)
- **bank** — IELTS question bank, Part 1 / 2 / 3
- **invite** — referral link, reward tiers, invited list
- **profile** — plan + upgrade, streak, progress tiles, lesson history; a row opens the teachers/lessons flow

Lessons (`LessonsScreen`), Q&A (`QaScreen`) and the separate matches view stay in the codebase but are reached from within a tab rather than the main bar.

## Structure

```
src/
├── telegram.ts    lazy wrapper over window.Telegram.WebApp (initData, theme, openInvoice, openTelegramLink)
├── api.ts         api<T>(path, init) — fetch with x-telegram-init-data header
├── styles.css     Tailwind v4 entry + committed brand tokens + gradient primary fills
├── App.tsx        bottom tab bar (lucide icons) + screen switch + admin gate
└── screens/       SpeakingScreen, BankScreen, InviteScreen, ProfileScreen, AdminScreen,
                   LessonsScreen, QaScreen, PartnersScreen, MatchesScreen
```

## Styling rules

- **Committed dark brand identity** (founder direction), not the Telegram theme: `styles.css` defines the `tg-*` tokens as fixed warm-dark + terracotta values via `@theme`. Change the palette in that one file — every screen repaints, no component edits.
- Tailwind utilities only, through the tokens: `bg-tg-bg`, `text-tg-text`, `text-tg-hint`, `text-tg-link`, `bg-tg-button`, `text-tg-button-text`, `bg-tg-secondary`. `bg-tg-button` also carries a terracotta gradient. `font-mono` for links/counts/labels.
- Never talk to Supabase directly — all data goes through the server's `/api/*`.
