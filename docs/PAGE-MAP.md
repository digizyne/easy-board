# EASY Board — Information Architecture / Page Map (v1)

Locked with the founder 2026-07-23. Companion to [PRICING.md](./PRICING.md) and
[STACK.md](./STACK.md).

Two surfaces in one Nuxt codebase:
- **Marketing site** — public, server-rendered for SEO. This is the lead engine.
- **App** — authenticated, client-heavy (the board). Not indexed.

Legend: 🌐 public/SSR · 🔒 auth required · 💳 tier-gated

---

## 1. Marketing site (the funnel)

| Route | Page | Purpose / funnel role |
|---|---|---|
| `/` | 🌐 Home / landing | The pitch: "Agile, minus everything that slows you down." Hero → the card + two columns → CTA to Free signup and to the book. |
| `/method` | 🌐 What is EASY | Explains the methodology (the card, Done/Not Done, no assignees/points). Credibility + SEO for "EASY methodology." |
| `/pricing` | 🌐 Pricing | The four tiers from PRICING.md. Every path routes serious orgs toward "Talk to us." |
| `/never` | 🌐 Features We'll Never Build | The anti-roadmap. Brand moat + memorable, shareable page. |
| `/book` | 🌐 The Book | Promo, buy links, free sample chapter. Legitimacy engine → drives signups + consulting trust. |
| `/consulting` | 🌐 Consulting / Services | **The money page.** Rollout, coaching, certification. Primary CTA → Talk to us. |
| `/talk` | 🌐 Talk to us | Lead form → Resend + CRM. The Enterprise/consulting on-ramp. |
| `/blog` | 🌐 Blog / Resources index | SEO content engine for top-of-funnel. (Phase 2 — stub for now.) |
| `/blog/[slug]` | 🌐 Blog post | Individual article. |
| `/privacy` | 🌐 Privacy Policy | Legal. |
| `/terms` | 🌐 Terms of Service | Legal. |
| `/dpa` | 🌐 Data Processing Addendum | Legal — needed to close Business/Enterprise deals. |

---

## 2. Auth

| Route | Page | Purpose |
|---|---|---|
| `/signup` | 🌐 Sign up | Free-tier account creation (Supabase Auth). |
| `/login` | 🌐 Log in | Email/password + SSO (SSO shown for Business/Enterprise). |
| `/forgot` | 🌐 Forgot password | Request reset. |
| `/reset` | 🌐 Reset password | Set new password (from email link). |
| `/confirm` | 🌐 Auth callback | Supabase email-confirm / OAuth / SSO callback handler. |
| `/invite/[token]` | 🌐 Accept invite | Join a board/org from an invite link. |

---

## 3. App (authenticated)

| Route | Page | Purpose |
|---|---|---|
| `/app` | 🔒 Boards dashboard | List of the user's boards. Create new (Free capped at 3 boards). |
| `/app/b/[id]` | 🔒 The Board | **Product core.** Two columns: Not Done · Done. Add card, edit card, drag to Done. Realtime sync. AI card-assist button. |
| `/app/b/[id]/settings` | 🔒 Board settings | Rename, delete, manage collaborators/invites (Free capped at 3). |
| `/app/b/[id]/archive` | 🔒 Done archive | Older Done cards (Free: 90 days · paid: unlimited). |
| `/app/portfolio` | 🔒💳 Portfolio view | Org-wide Done rollup across teams. Business+ only. |
| `/app/settings/account` | 🔒 Account | Profile, password, delete account. |
| `/app/settings/billing` | 🔒 Billing | Stripe customer portal (plan, seats, invoices). |
| `/app/settings/team` | 🔒💳 Team / org | Members, roles, SSO/SCIM setup. Business+ only. |

---

## 4. Global elements

- **Marketing header/footer** — nav across all 🌐 pages; persistent "Start free"
  + "Talk to us" CTAs.
- **App shell** — sidebar (boards, portfolio, settings), account menu.
- **404 / error** page.
- **Upgrade modal** — shown when a Free user hits a limit (4th board, invite #4,
  archive >90 days, portfolio) → routes to `/pricing` or Stripe checkout.

---

## Build priority (proposed)

1. **App core:** `/signup` → `/login` → `/app` → `/app/b/[id]` (the board).
   The product must exist before the funnel has anything to sell.
2. **Funnel:** `/`, `/method`, `/pricing`, `/never`, `/book`, `/consulting`,
   `/talk`.
3. **Monetization:** billing, tier gates, upgrade modal.
4. **Business tier:** portfolio, team/SSO.
5. **Phase 2:** blog/SEO engine.
