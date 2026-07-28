# EASY — Brand & Look/Feel (v1)

Locked with the founder 2026-07-27. The visual identity of the EASY empire:
website, app, book collateral, decks, and consulting materials should all draw
from this.

## The idea

EASY is radical subtraction: a card, two columns, Done or Not Done. The visual
identity mirrors that — **monochrome surfaces + one decisive accent**. The
accent is green because green *is the thesis*: green = Done = ship it. Every
time someone looks at an EASY board, the brand color and the methodology say
the same thing.

We deliberately avoid corporate blue — the color of the incumbents EASY is
positioned against (Jira, Trello, Asana).

## Palette — "Ship Green"

Set in [`../app/app.config.ts`](../app/app.config.ts) via Nuxt UI. Both are
built-in Tailwind palettes, so no custom CSS is needed.

| Role | Palette | Key values |
|---|---|---|
| **Primary** (accent, CTAs, Done, brand) | **Emerald** | 500 `#10B981` · 600 `#059669` (hover) · 400 `#34D399` (dark-mode accent) |
| **Neutral** (surfaces, text, borders) | **Zinc** | 50 `#FAFAFA` · 500 `#71717A` · 900 `#18181B` · 950 `#09090B` (dark bg) |

Semantic Nuxt UI tokens (`text-muted`, `bg-elevated`, `border-default`, etc.)
resolve from zinc automatically. Use `text-primary` / `color="primary"` for the
accent — never hardcode hex in components.

## Appearance

- **Default: system** (respects the visitor's OS light/dark). Both modes are
  fully styled; users can toggle via the color-mode button.

## Typography

- **Public Sans** (`--font-sans` in [`../app/assets/css/main.css`](../app/assets/css/main.css))
  — clean, neutral, geometric. Reinforces the plain-spoken, no-nonsense tone.

## Usage rules

1. **One accent, everywhere else neutral.** Emerald signals action and "done."
   Don't introduce secondary brand colors; keep the palette monochrome + green.
2. **Green means done.** Reserve strong emerald fills for completion, primary
   CTAs, and the wordmark. Not-Done / neutral states stay zinc.
3. **Status colors are exempt.** Error/warning/success toasts use Nuxt UI's
   semantic colors as normal — those are UI feedback, not brand.
4. **Wordmark:** "EASY" set bold in emerald (see
   [`../app/components/EasyLogo.vue`](../app/components/EasyLogo.vue)).

## Changing it later

Swap `primary` / `neutral` in `app.config.ts` — one line each. No other code
references brand hex directly, by rule #2 above.
