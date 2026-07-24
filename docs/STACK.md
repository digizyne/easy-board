# EASY Board — Tech Stack (v1)

Locked with the founder 2026-07-23.

- **Build model:** Founder is semi-technical; Claude Code writes all the code.
  Keep it simple, conventional, and well-documented.
- **Role of the app:** Consulting funnel first (see [PRICING.md](./PRICING.md)) —
  the marketing site is the lead engine; the board is the credibility/demo core.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 3 + TypeScript** (Vue) | One codebase for marketing site + board app. SSR for SEO (funnel). |
| Hosting | **Vercel** | Nuxt/Nitro Vercel preset, per-branch previews. |
| DB + Auth + Realtime | **Supabase** (Postgres) | `@nuxtjs/supabase` module. Realtime powers live two-column sync; RLS for multi-tenant boards; SAML SSO on higher plans (Business/Enterprise tiers). |
| Billing | **Stripe** | Per-seat subscriptions + hosted checkout + customer portal. Called from Nitro server routes. |
| AI card assist | **Anthropic Claude API** | Outcome-rewrite + card-split suggestions. Runs server-side (Nitro) so the API key never hits the client. |
| UI | **Nuxt UI + Tailwind CSS** | Official Nuxt component library (built on Tailwind + Reka UI). Auto-imported components, built-in theming and dark mode — minimal aesthetic that matches EASY. |
| Email / leads | **Resend** | Transactional email + routes "Talk to us" leads into the consulting funnel. |

## Rationale (short)

- The board's only hard problem is live sync — Supabase Realtime solves it out
  of the box, so no hand-rolled backend is justified yet.
- Nuxt gives server-rendered marketing pages Google will index — critical for a
  lead-gen funnel — plus a single codebase for the app.
- Managed services (Supabase, Stripe, Vercel, Resend) keep ops near zero so
  effort goes to brand and consulting pipeline, not infrastructure.

## Notable deviation from a default React setup

- UI kit is **Nuxt UI** (the Nuxt team's official library, built on Tailwind +
  Reka UI), not React's shadcn/ui. Tighter Nuxt integration: auto-imported
  components, theming, and dark mode out of the box.
