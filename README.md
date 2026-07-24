# EASY Board — webapp

The web application for the EASY methodology (Enumerative Agile subSYstem):
a marketing/funnel site plus the EASY board product (two columns — Not Done ·
Done — and nothing else).

## Stack

Nuxt 4 + TypeScript · Nuxt UI + Tailwind · Supabase (DB/Auth/Realtime) ·
Stripe (billing) · Anthropic Claude API (AI card assist) · Resend (email) ·
Vercel (hosting).

Full rationale and plans live in [`docs/`](./docs):
- [`docs/STACK.md`](./docs/STACK.md) — stack + reasoning
- [`docs/PRICING.md`](./docs/PRICING.md) — tiers & features
- [`docs/PAGE-MAP.md`](./docs/PAGE-MAP.md) — information architecture

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev            # http://localhost:3000
```

Minimum to boot: `SUPABASE_URL` and `SUPABASE_KEY` (the Supabase module
requires them). Stripe / Anthropic / Resend keys are only needed once those
features are built.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — ESLint
- `npm run typecheck` — type check

## Conventions

- Only `/app/**` routes require auth (see `nuxt.config.ts` → `supabase`).
  Everything else is public and prerendered for SEO.
- Server-only secrets go in `runtimeConfig`; never expose them to the client.
- The card data model never grows: no assignees, due dates, points, or custom
  columns — at any tier. See `docs/PRICING.md`.
