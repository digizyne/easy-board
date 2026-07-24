# EASY Board — Pricing & Tiers (v1)

Source-of-truth spec for the webapp's plans. Decisions locked with the founder
2026-07-23:

- **App's role:** Consulting funnel first. Maximize adoption → book sales →
  enterprise consulting leads. SaaS revenue is a welcome bonus, not the goal.
- **Pricing model:** Per user / month.
- **AI gating:** Limited on Free, full on paid.

---

## The one rule that governs every tier

EASY's value is *subtraction*. Tiers may **never** differ by adding to the
card's data model. No tier — however expensive — gets assignees, due dates,
story points, priority fields, labels, custom columns, WIP limits, an
"In Progress" column, or a "Blocked" state. Minimalism is the product, not a
feature to be paywalled.

Tiers differ **only** along axes that don't touch the card:
scale · collaboration & retention · trust/security infrastructure ·
AI assistance · human services (the consulting on-ramp).

Marketing corollary: ship a public **"Features We Will Never Build"** page
(the anti-roadmap). It protects the brand and it's memorable.

---

## Tiers

### Free — "Solo"  ·  $0
Top-of-funnel. Deliberately generous so real teams live here, buy the book,
and become consulting leads.
- Up to 3 collaborators
- 3 boards
- Unlimited cards
- Real-time sync
- Done archive: 90 days
- AI card assist: **limited** (a few outcome-rewrites / split-suggestions per day)
- Community support

### Team — "The Board"  ·  ~$8 / user / mo
Bread-and-butter recurring revenue for real product teams.
- Unlimited collaborators (per seat)
- Unlimited boards
- Unlimited cards
- Real-time sync
- Done archive: unlimited
- AI card assist: **full**
- Integrations: GitHub/GitLab/CI auto-move-to-Done, Slack
- Export / API
- Email support

### Business — "The Org"  ·  ~$18 / user / mo (min. seats)
Mid-market, multi-team. **These accounts are the consulting leads.**
- Everything in Team, plus:
- Portfolio view (org-wide Done rollup — still just counting Done cards)
- SSO / SAML, SCIM provisioning
- Admin roles, audit log
- "EASY Certified" team badge
- Priority support

### Enterprise / Consulting  ·  Custom — "Talk to us"
A consulting on-ramp wearing a SaaS badge. This is where the real money is.
- Everything in Business, plus:
- **Guided EASY rollout + dedicated EASY coach** (certified practitioner)
- Team training & certification
- On-prem / VPC deployment option
- DPA, custom SLA
- Custom/enterprise SSO

---

## On-brand feature notes

- **AI card assist** never adds fields. It only (a) rewrites a card as an
  *outcome* ("email validation is live on the registration form" vs. "write a
  validation function") and (b) flags a card too big to finish in one session
  and suggests a split. Straight from Ch. 9 — reinforces the doctrine.
- **CI/CD "auto-move-to-Done on deploy"** operationalizes the book's strict
  definition of Done (reviewed, merged, deployed, real — Ch. 11). Strong demo
  and retention hook.
- **Portfolio view** is just a count of Done cards across teams. It gives
  skeptical execs the visibility they want without betraying minimalism — and
  it primes the consulting sale.
- Every tier keeps the promise: no assignees, no due dates, no points, ever.

---

## Funnel logic

Free (adopt) → buy the book (legitimacy) → Team/Business (recurring + qualify)
→ Enterprise (consulting engagement = bulk of revenue).
Every plan page should route serious orgs toward "Talk to us."
