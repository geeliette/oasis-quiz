# Oasis Quiz

A colorful, Jeopardy-style trivia board builder with built-in team
scorekeeping. Create a board, share a link, and host the game on one
shared screen — no accounts, no buzzers.

## Stack

- **Next.js (App Router) + TypeScript** — fast to build, deploys natively on Vercel.
- **Tailwind CSS v4** — design tokens (colors, radii, shadows) drive a consistent "game show" theme.
- **Framer Motion** — the flip-card clue reveal on the play screen.
- **Upstash Redis** (via `@upstash/redis`) — each game is a JSON document keyed by its share id (`game:<id>`). No schema or migrations needed. Falls back to a local JSON file (`.data/games.json`, gitignored) when no Redis credentials are set, so `npm run dev` works out of the box with zero setup.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are required locally — games are persisted to `.data/games.json` automatically. Visit `/game/demo` to see the seeded demo board (created on first request).

## Environment variables (required for production / Vercel)

The local file fallback is **not available** once deployed (serverless functions don't have a writable, persistent filesystem), so you must connect a Redis database before games can be saved in production. The app will show a clear error on any game page if it's missing.

1. In your Vercel project, go to **Storage → Marketplace Database Providers** and add an **Upstash Redis** database (a free tier is sufficient).
2. Connect it to your project — Vercel automatically sets the required environment variables for you (either `KV_REST_API_URL` / `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, depending on integration version — this app reads either pair).
3. Redeploy (or trigger a new deployment) so the functions pick up the new environment variables.

To run against the same Redis instance locally, copy the values into a `.env.local` file:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (or run `vercel`).
2. Add the Upstash Redis integration as described above before your first real deploy.
3. No other configuration is needed — the build command, output, and routing are all handled by Next.js defaults.

## Data model

Each game is a single JSON document:

```
Game { id, title, categories: Category[], teams: Team[], createdAt, updatedAt }
Category { id, name, clues: Clue[] }
Clue { id, value, question, answer, revealed, answered }
Team { id, name, color, score }
```

Games expire automatically (Redis TTL, set in `lib/expiry.ts`): 90 days after they were last saved or opened, or 7 days for boards that were never filled in. New boards and demo copies aren't stored until their first edit.

## Seed data

The demo board (`/game/demo`) is built from `lib/demo.ts` on every request and is never saved, so each visitor sees the original board — play progress resets on reload and nobody can change it for others. Clicking **Edit a copy** on the demo saves a personal copy under a new id and opens it in the editor.
