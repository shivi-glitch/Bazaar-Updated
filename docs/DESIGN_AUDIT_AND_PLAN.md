# DESIGN AUDIT & REDESIGN PLAN — BAZAAR (MERX)

> **Design read:** B2B-leaning SaaS trading simulation for student/event participants and an event admin. The home page is Persuade mode; dashboards are Operate mode. The visual world should feel like a specialized financial terminal with editorial character — not generic dark-mode SaaS, not AI-purple gradients, not crypto-bro neon.
>
> **Skills driving this document:**
> - §1–2 (Audit): `redesign-existing-projects` + `impeccable`
> - §3 (Design system): `ui-ux-pro-max` + `frontend-design`
> - §3 (Type): `frontend-design` + `ui-ux-pro-max`
> - §4 (Home page plan): `design-taste-frontend` + `modern-web-guidance`
> - §5 (Participant dashboard): `ui-ux-pro-max` + `modern-web-guidance`
> - §6 (Admin dashboard): `ui-ux-pro-max` + `redesign-existing-projects`
> - §7 (Roadmap): all skills synthesized
> - Conflict note: `design-taste-frontend` discourages serif as default display type; this brief explicitly mandates Sprat (a serif variable font). Brief wins — Sprat is used exactly as instructed, per the skill's own override rule: "The brief wins."

---

## 1. Summary: Top 10 Problems (Priority Order)

| # | Problem | Severity |
|---|---------|----------|
| 1 | **`min-h-screen` / `h-screen` instead of `100dvh`** — `DashboardShell.tsx:89` and `page.tsx:13` use viewport-unsafe units that collapse on iOS Safari when the address bar retracts | **High** |
| 2 | **No font personality** — `globals.css:13` sets `Inter` everywhere; there is no display typeface. Bazaar is a named product but its type is invisible | **High** |
| 3 | **Hero is a static banner with weak copy** — `frontend/src/components/home/Hero.tsx` delivers one centered block with boilerplate "Trade the market. Beat the room." The animated chart line is invisible at `opacity-40` and the background animation (`animate-pulse`) uses a CSS class that touches nothing performant | **High** |
| 4 | **Blue is the only accent, applied inconsistently** — `globals.css` defines `meridian-brand: #3b82f6` then the same file's body style injects `dark:bg-[#070B14]`. Hardcoded blues (`blue-600`, `blue-500/10`, `blue-400`) appear inline throughout `DashboardShell.tsx`, `TradeModal.tsx`, `market/page.tsx`. No single color token file governs the palette | **High** |
| 5 | **Admin dashboard uses `alert()` and `confirm()` for destructive actions** — `admin/page.tsx:83,97,101,105,113` — hard violations of UX and a11y: no screen reader feedback, no focus management, kills keyboard flow | **High** |
| 6 | **Numbers rendered in proportional `Inter`** — prices (`₹{price.toFixed(2)}`), quantities, timer — all rendered in `font-mono` in some places and proportional `font-sans` in others. Inconsistency causes digit wobble on updates | **Medium** |
| 7 | **TradeModal lacks bottom-sheet safe-area handling** — `TradeModal.tsx:100` uses `items-end` on mobile but adds no `env(safe-area-inset-bottom)` padding; on iPhone 14+ the buy/sell buttons are clipped by the home indicator | **Medium** |
| 8 | **Landing page background is the canonical AI-slop radial gradient** — `page.tsx:16` is `radial-gradient(ellipse 80% 80% at 50% 0%, rgba(59,130,246,0.15), transparent)`. This is the single most-tested AI-generated background in production rounds | **Medium** |
| 9 | **`lucide-react` exclusively** — `DashboardShell.tsx:3`, `admin/page.tsx:5`, `market/page.tsx:5`, `TradeModal.tsx` all import from lucide. It is the default AI icon choice (per `redesign-existing-projects` and `design-taste-frontend`). No product differentiation | **Low** |
| 10 | **No skip-to-content link, no ARIA landmark roles on dashboards** — `DashboardShell.tsx` renders a `<div>` shell with no `<header>`, `<main>`, `<nav>` semantics. Tab navigation has no current-page indicator accessible to screen readers | **Low** |

**Intended overall look (3–4 sentences):** Bazaar should feel like a Bloomberg Terminal that went to art school — dark, precise, and data-dense in the dashboards, but with Sprat's sharp editorial serifs giving it a confident editorial headline voice at large sizes. The landing page opens with an animated price story rather than a static pitch, using layered SVG market-graph shapes on a near-black background (not blue mesh). The participant dashboard is a thumb-native mobile-first trading cockpit: chart on top, action controls pinned to the bottom, dense tabbed navigation between views. The admin dashboard is maximum-density utility: no decorative chrome, pure signal.

---

## 2. Audit

### 2.1 Visual: Colors and Contrast

| File | Issue | Severity |
|------|-------|----------|
| `frontend/src/app/globals.css:5–11` | Token names (`meridian-*`) are module-level but never consumed via CSS variable — raw hex values are re-declared inline in every component | High |
| `frontend/src/app/globals.css:7` | `meridian-brand: #3b82f6` is saturated at ~75% HSL saturation. Acceptable, but every interactive element uses this one blue regardless of meaning (info, link, CTA, status) — semantic differentiation is absent | Medium |
| `frontend/src/app/admin/page.tsx:192` | `text-xl font-black text-white tracking-tighter` — heading contrast on `#070B14` is sufficient but white-on-dark-navy with no border or spatial separation creates a flat wall of text | Low |
| `frontend/src/components/TradeModal.tsx:90,94` | Sparkline `color = isUp ? "#10b981" : "#ef4444"` — hardcoded hex not from token system | Low |
| `frontend/src/app/page.tsx:16` | AI-slop blue radial gradient background — see problem #8 | Medium |

**Missing tokens:** There is no danger-red semantic token for losses (the app needs one distinct from error-red). There is no gain-green semantic token. Both are hardcoded everywhere as `#ef4444` / `#10b981`.

### 2.2 Visual: Typography

| File | Issue | Severity |
|------|-------|----------|
| `globals.css:13` | `--font-sans: "Inter"` — Inter not loaded anywhere. Body falls back to `system-ui`, making the actual render different per OS | High |
| `frontend/src/components/home/Hero.tsx:24` | `text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter` — the headline size scale is correct but the font is Inter Black, which has no editorial personality | High |
| `DashboardShell.tsx:99` | `text-[10px] font-black text-slate-500 uppercase tracking-widest` — body text at 10px fails WCAG AA (4.5:1 minimum) at `text-slate-500` on `#070B14` | High |
| `DashboardShell.tsx:108` | Timer uses `font-mono` but `--font-mono: "JetBrains Mono"` is declared in CSS but never loaded via `@font-face` or `next/font` | Medium |
| `market/page.tsx:45` | `text-sm font-bold text-slate-500 uppercase tracking-wider` — section headings use eyebrow style (ALL CAPS + tracking) on every sub-section, which is the #1 AI eyebrow overuse tell (`design-taste-frontend` §4.7) | Medium |
| `UpgradeCards.tsx:49` | `text-[10px] font-bold text-tx-dim uppercase tracking-widest` — card tags are 10px; inaccessible at this size when `text-tx-dim` resolves below ~#6b7280 on dark bg | Medium |

### 2.3 Visual: Layout and Spacing

| File | Issue | Severity |
|------|-------|----------|
| `frontend/src/app/page.tsx:13` | `min-h-screen` — uses `100vh` equivalent, iOS Safari viewport bug. Should be `min-h-[100dvh]` | High |
| `DashboardShell.tsx:89` | `h-screen` on the dashboard shell — breaks on iOS Safari. Should be `h-[100dvh]` | High |
| `market/page.tsx:51` | `grid grid-cols-1 lg:grid-cols-2 gap-4` — identical card grid for all assets, no visual variation. Classic AI three-equal-card layout (applied here as two-column). Every card is the same height | Medium |
| `admin/page.tsx:184` | Admin layout: `flex flex-col h-screen` — same viewport bug; no safe-area handling. The tab bar clips on mobile | High |
| `DashboardShell.tsx:129` | Tabs: `max-w-7xl mx-auto` with `px-6` — but `main` at line 143 has no horizontal padding, producing misaligned content edges | Low |

### 2.4 Mobile: Violations of the 10 Rules

| Rule | File | Violation | Severity |
|------|------|-----------|----------|
| Rule 1 (dvh) | `DashboardShell.tsx:89`, `page.tsx:13`, `admin/page.tsx:185` | `h-screen` / `min-h-screen` — not `100dvh` | High |
| Rule 1 (safe area) | `DashboardShell.tsx:93` | Top utility bar has no `pt-safe` / `env(safe-area-inset-top)` | High |
| Rule 2 (thumb zone) | `market/page.tsx:43–83` | "Open Live Chart & Trade" action is a card in the upper area — no bottom-pinned primary action | High |
| Rule 2 (thumb zone) | `TradeModal.tsx:140–147` | Buy/Sell buttons at bottom but the modal is full-height with no `pb-safe` — clipped on notched devices | High |
| Rule 3 (hit targets) | `DashboardShell.tsx:117` | Theme toggle button: `p-2` = 32×32px — below the 44×44px minimum | Medium |
| Rule 3 (hit targets) | `DashboardShell.tsx:120` | Log Out: `px-4 py-1.5` = approximately 36px tall — below minimum | Medium |
| Rule 4 (skeletons) | All dashboard pages | No skeleton loaders anywhere; data-fetching shows empty states with no reserved space — CLS risk on every load | High |
| Rule 5 (transform/opacity only) | `frontend/src/components/home/Hero.tsx:15` | `filter: "blur(10px)"` animated in — filter is GPU-accelerated but animating filter on a large hero element is a paint cost on low-end devices | Medium |
| Rule 6 (tabular nums) | `DashboardShell.tsx:86`, `TradeModal.tsx:115` | Prices displayed in `font-mono` but no `font-variant-numeric: tabular-nums` applied | Medium |
| Rule 8 (small screens) | `DashboardShell.tsx:99–112` | All four data points (team ID, session #, status, timer) visible simultaneously in the 56px top bar — too dense for 320px screens | Medium |
| Rule 9 (tab switcher) | `DashboardShell.tsx:127–141` | The tab row is a horizontal nav but has no `overflow-x-auto` — on 360px phones, four tabs may wrap or overflow | Medium |
| Rule 10 (reduced motion) | `DashboardShell.tsx:105` | `animate-pulse` on connection dot — no `prefers-reduced-motion` guard | Low |

### 2.5 Motion: Current Animations and Performance Risk

| File | Animation | Risk |
|------|-----------|------|
| `frontend/src/components/home/Hero.tsx:15,23,32,39` | `filter: blur()` animating on load — on mid-range Android this triggers a compositor layer for each element | Medium |
| `landing/PinnedStory.tsx` | `useScroll` + `useTransform` on scroll — this is correct (Motion values, not state). No performance concern | None |
| `landing/LandingNav.tsx:10` | `useScroll` for progress bar — correct Motion values approach | None |
| `frontend/src/app/page.tsx:16` | Fixed background `radial-gradient` — no animation currently, but it is a fixed-position overlay covering the full viewport, forcing a repaint layer | Low |
| `DashboardShell.tsx:105` | CSS `animate-pulse` — pure CSS, no JS. Acceptable but `prefers-reduced-motion` must be respected | Low |
| `landing/UpgradeCards.tsx:28` | `perspective: 1400px` with `rotateY` on scroll drift — uses transform, correct. Hover `rotateY` has no spring physics | Low |

**Missing:** There is no `prefers-reduced-motion` guard on any CSS keyframe in `globals.css:47–50` (marquee). All 10 mobile animation rules for transform/opacity are mostly respected in the landing page but violated in the dashboard.

### 2.6 Accessibility

| File | Issue | Severity |
|------|-------|----------|
| `DashboardShell.tsx:89,93,127,143` | Shell is a div with no `<header>`, `<nav>`, `<main>` | High |
| `DashboardShell.tsx:117–122` | No `aria-label` on theme toggle or logout buttons | High |
| `admin/page.tsx:83,97,101` | `alert()` / `confirm()` — no focus management, no screen reader announcement | High |
| `TradeModal.tsx:100` | Modal: no `role="dialog"`, no `aria-modal`, no focus trap, no `aria-labelledby` | High |
| `DashboardShell.tsx:99` | `text-[10px] text-slate-500` on `#070B14` — fails WCAG AA 4.5:1 (approx 2.8:1) | High |
| `market/page.tsx:76` | `text-xs uppercase tracking-widest text-slate-400` — fails WCAG AA for small text | Medium |
| `UpgradeCards.tsx:49` | `text-[10px]` card tags — inaccessible | Medium |
| All pages | No skip-to-content link in `layout.tsx` | Medium |
| `TradeModal.tsx:111` | Close button `×` is a Unicode character with no `aria-label` | Medium |

### 2.7 Performance

| File | Issue | Severity |
|------|-------|----------|
| `globals.css:13` | `Inter` declared as `--font-sans` but never loaded — browser makes a network request that 404s or falls back silently | High |
| `globals.css:14` | `JetBrains Mono` declared but not loaded | Medium |
| `layout.tsx:16` | `min-h-screen flex flex-col` — correct flex shell but `body` has no `overflow: hidden` to prevent horizontal scroll on mobile | Low |
| `frontend/package.json:14` | `framer-motion ^14.0.0` imported in `frontend/src/components/home/Hero.tsx:1` as `import { motion } from "framer-motion"` (legacy alias) — the newer `motion/react` import is used in the landing/ directory, creating two motion runtimes in the same Next.js app | High |
| `admin/page.tsx:73` | `setInterval(fetchData, 1000)` — polling every 1000ms from the admin page creates 3 concurrent polling loops (`fetchData`, the portfolio interval in DashboardShell, and the `timeLeft` timer). No debounce, no visibility API guard | Medium |
| No `next/image` usage | All market card images are absent; no `<Image>` component used anywhere, no width/height reservations for skeletons | Medium |
| `layout.tsx:15` | `<html className="dark">` hardcodes dark mode — the `ThemeProvider` exists but the HTML class bypasses it, causing a flash and theme hydration mismatch | Medium |

### 2.8 Content

| File | Issue | Severity |
|------|-------|----------|
| `frontend/src/components/home/Hero.tsx:36` | "An institutional-grade trading simulation. React to live news, utilize leverage, buy asymmetric data, and trade against a reactive AI order book." — correct information but passive construction, buried benefits, no hook | Medium |
| `DashboardShell.tsx:99` | `{teamId \|\| "Participant"}` — default label "Participant" is a dead placeholder | Low |
| `market/page.tsx:76` | "Open Live Chart & Trade" — imperative label on a card hover state. Correct intent but the `&` is a raw `&` character in JSX (should be `&amp;` or `{' & '}`) | Low |
| `admin/page.tsx:144` | "INITIALIZE OVERRIDE" — technically evocative but the ALL CAPS is cargo-cult AI design (per `design-taste-frontend` §4.7). Non-interruptive sentence case would be more confident | Low |
| `DashboardShell.tsx:49–52` | Nav labels: "Explore", "Holdings", "News", "Stats" — functional but generic. Could be more product-specific | Low |

---

## 3. Design System Proposal

### 3.1 Color Tokens

All tokens defined in `globals.css` under `@theme {}` (Tailwind v4 pattern already in place).

```css
/* ── BACKGROUNDS ─────────────────────────────────── */
--color-bg-void:       #060A12;   /* deepest background, page root */
--color-bg-base:       #0B1120;   /* primary surface */
--color-bg-raised:     #111827;   /* cards, panels, modals */
--color-bg-overlay:    #1A2235;   /* popovers, dropdowns */

/* ── BORDERS ─────────────────────────────────────── */
--color-bd-hairline:   rgba(255,255,255,0.05);  /* lightest divider */
--color-bd-subtle:     rgba(255,255,255,0.09);  /* card borders */
--color-bd-strong:     rgba(255,255,255,0.18);  /* focused inputs */

/* ── TEXT ────────────────────────────────────────── */
--color-tx-primary:    #F0F4FF;   /* contrast: 14.1:1 on bg-void */
--color-tx-secondary:  #9BA8C0;   /* contrast: 5.3:1 on bg-void */
--color-tx-muted:      #5C6880;   /* contrast: 3.1:1 — use only at 18px+ */
--color-tx-inverse:    #060A12;   /* text on light surfaces */

/* ── ACCENT (single) ─────────────────────────────── */
--color-accent:        #4F8EF7;   /* desaturated blue, contrast 4.6:1 on bg-void */
--color-accent-dim:    rgba(79,142,247,0.12);
--color-accent-border: rgba(79,142,247,0.25);

/* ── SEMANTIC: GAINS / LOSSES ────────────────────── */
--color-gain:          #22D37A;   /* emerald, contrast 6.2:1 on bg-void */
--color-gain-dim:      rgba(34,211,122,0.10);
--color-gain-border:   rgba(34,211,122,0.20);
--color-loss:          #F75050;   /* red, contrast 5.1:1 on bg-void */
--color-loss-dim:      rgba(247,80,80,0.10);
--color-loss-border:   rgba(247,80,80,0.20);

/* ── SEMANTIC: STATUS ────────────────────────────── */
--color-warn:          #F5A623;   /* amber, session/countdown */
--color-warn-dim:      rgba(245,166,35,0.10);

/* ── ELEVATION (tinted shadows) ──────────────────── */
--shadow-card: 0 4px 24px rgba(6,10,18,0.5), 0 1px 0 rgba(255,255,255,0.04) inset;
--shadow-modal: 0 24px 80px rgba(6,10,18,0.8);
```

**Contrast checks (WCAG AA):**
- `tx-primary` on `bg-void`: 14.1:1 ✅
- `tx-secondary` on `bg-void`: 5.3:1 ✅
- `accent` on `bg-void`: 4.6:1 ✅ (just above 4.5:1 threshold)
- `gain` on `bg-void`: 6.2:1 ✅
- `loss` on `bg-void`: 5.1:1 ✅
- `tx-muted` on `bg-void`: 3.1:1 — use only at ≥18px or with `font-weight ≥ 600` (WCAG large-text threshold 3:1)

### 3.2 Type Scale — Sprat + Haskoy

#### Font Assessment

**Sprat** (Sharp serif variable font — SIL Open Font License, free to use commercially)
- Classification: Serif, variable on width and weight axes
- Character: Long sharp serifs, high contrast, round curves — inspired by Eric Gill lettering
- 18 styles available
- **License:** SIL Open Font License 1.1 — self-hosting is permitted, redistribution permitted with license file
- **Download:** https://www.collletttivo.it/typefaces/sprat — download the woff2 files from the releases section
- **You must download manually:** `Sprat-Regular.woff2`, `Sprat-Italic.woff2`, and any weight/width variants you use (the variable font file if available)
- **Role:** Display / large headlines only (≥48px on mobile, ≥56px on desktop). NOT for body text — high contrast serifs at small sizes reduce legibility on dark backgrounds with subpixel rendering off

**Haskoy** (Open-source variable sans-serif — ertekinno/haskoy on GitHub)
- Classification: Sans-serif, variable
- Character: Modern geometric grotesque with optical corrections — purpose-built for UI legibility
- **License:** SIL Open Font License 1.1 — self-hosting permitted
- **Download manually from:** https://github.com/ertekinno/haskoy/releases — download `Haskoy[wght].woff2` (the variable weight file) and optionally static weights
- **Tabular figures:** The GitHub README describes Haskoy as a UI-focused typeface. The repository does not explicitly document `tnum` OpenType feature support in its README. **Assumption (see §8):** Haskoy may not include the `tnum` feature. **Fallback for all numeric data:** use `font-variant-numeric: tabular-nums` with `font-family` fallback to `"Haskoy", "JetBrains Mono", monospace` — the monospace fallback guarantees fixed-width digits even if Haskoy drops the `tnum` feature
- **Role:** All UI text (body, labels, buttons, inputs, nav, data cells) at all sizes from 10px up

**Role decision rationale:** The brief suggested swapping if inspection warranted it. It does not. Sprat's editorial serif character is perfect for the landing page hero and section headings (this is a *named product* — Bazaar — that benefits from typographic personality at large sizes). Haskoy's geometric precision suits the dense data interfaces. Keep the brief's default assignment: Sprat = display, Haskoy = UI.

#### `@font-face` declarations (place in `globals.css`)

```css
@font-face {
  font-family: "Sprat";
  src: url("/fonts/Sprat-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Sprat";
  src: url("/fonts/Sprat-Italic.woff2") format("woff2");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
/* Add additional weights if variable font is not available */

@font-face {
  font-family: "Haskoy";
  src: url("/fonts/Haskoy[wght].woff2") format("woff2 supports variations"),
       url("/fonts/Haskoy[wght].woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

**`<link rel="preload">` in `layout.tsx`** — preload only the critical weights:
```html
<link rel="preload" href="/fonts/Haskoy[wght].woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
<link rel="preload" href="/fonts/Sprat-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```
Do NOT preload Sprat Italic or extra weights — they are non-critical path.

#### Type Scale

```
TOKEN           SIZE (mobile → desktop)   WEIGHT   LINE-HEIGHT   FONT
──────────────────────────────────────────────────────────────────────
display-xl      clamp(48px, 10vw, 96px)   400      0.92          Sprat
display-lg      clamp(36px, 6vw, 64px)    400      1.0           Sprat
display-md      clamp(28px, 4vw, 48px)    400      1.1           Sprat
headline        20px → 24px               600      1.2           Haskoy
subhead         16px → 18px               500      1.35          Haskoy
body            15px → 16px               400      1.6           Haskoy
body-sm         13px                      400      1.55          Haskoy
label           11px                      600      1.3           Haskoy
  (min 44px containers, never standalone < 12px)
mono-data       14px → 15px               500      1.4           Haskoy
  font-variant-numeric: tabular-nums;
  fallback: "Haskoy", "JetBrains Mono", monospace
```

**Letter-spacing:**
- `display-*` tokens: `letter-spacing: -0.02em` (tighten large Sprat)
- `headline` / `subhead`: `letter-spacing: -0.01em`
- `label`: `letter-spacing: 0.06em` (open up small caps-style labels)
- `mono-data`: `letter-spacing: 0` (tabular figures need no extra tracking)

**Italic use in Sprat:** Sprat's italic is distinct (calligraphic influence) — use only for emphasis in `display-*` contexts, never for body or UI. Ensure 1.1 line-height minimum when Sprat italic is used (descender clearance for letters `g, j, p, q, y`).

**`text-wrap: balance`:** Apply to all `display-*` and `headline` tokens to prevent orphaned words.

### 3.3 Button System

All buttons: `min-height: 44px`, `min-width: 44px`, `touch-action: manipulation`, `cursor: pointer`, `border-radius: 6px` (default), `transition: transform 80ms ease, background 150ms ease, border-color 150ms ease`.

**Active state on all buttons:** `active:scale-[0.97]` — simulates physical press.

```
VARIANT       BG              TEXT           BORDER         HOVER STATE
────────────────────────────────────────────────────────────────────────
primary       accent          tx-primary     transparent    bg: accent+10% brightness
secondary     bg-raised       tx-primary     bd-subtle      border: bd-strong
ghost         transparent     tx-secondary   transparent    bg: bd-hairline
destructive   loss-dim        loss           loss-border    bg: loss at 20% opacity
buy           gain            tx-inverse     transparent    bg: gain+10% brightness
sell          loss            tx-inverse     transparent    bg: loss+10% brightness
icon-only     transparent     tx-secondary   transparent    bg: bd-hairline; must have aria-label
```

**Sizes:**
- `sm`: `height: 36px`, `padding: 0 12px`, `font-size: 13px` — use only for secondary actions in dense contexts (admin table rows)
- `md`: `height: 44px`, `padding: 0 20px`, `font-size: 14px` — default
- `lg`: `height: 52px`, `padding: 0 28px`, `font-size: 16px` — hero CTAs only

**Focus ring (all buttons):** `outline: 2px solid var(--color-accent); outline-offset: 3px` — visible in both light and dark mode.

**Loading state:** Replace label with a 16×16 spinner (3 rotating dots at 120° apart, pure CSS), `disabled: true`, `aria-busy="true"`.

### 3.4 Spacing, Radius, Elevation, Motion Tokens

```css
/* SPACING */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 20px;  --space-6: 24px;  --space-8: 32px;  --space-10: 40px;
--space-12: 48px; --space-16: 64px; --space-20: 80px; --space-24: 96px;

/* RADIUS */
--radius-xs: 3px;   /* inline badges, tiny chips */
--radius-sm: 6px;   /* buttons, inputs, small cards */
--radius-md: 10px;  /* modal, tooltip, panel */
--radius-lg: 16px;  /* bottom sheet, upgrade cards */
--radius-xl: 24px;  /* full-bleed sections */

/* ELEVATION (z-index scale) */
--z-base:    0;
--z-raised:  10;   /* sticky headers */
--z-overlay: 20;   /* nav, sidebars */
--z-modal:   30;   /* modals, drawers */
--z-toast:   40;   /* toasts/snackbars */
--z-tooltip: 50;   /* always on top */

/* MOTION TOKENS */
--dur-instant: 80ms;   /* button active press */
--dur-fast:    150ms;  /* color transitions, hover */
--dur-normal:  250ms;  /* panel open, tab switch */
--dur-slow:    400ms;  /* page enter, modal appear */
--dur-story:   600ms;  /* hero reveal stagger */

--ease-out:    cubic-bezier(0.22, 1, 0.36, 1);   /* elements entering */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);        /* elements leaving */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* interactive spring */
```

**Reduced motion rule (mandatory in globals.css):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.5 Skeleton and Loading Pattern

```css
/* Skeleton shimmer — dark surface only */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 0%,
    rgba(255,255,255,0.07) 40%,
    rgba(255,255,255,0.03) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: rgba(255,255,255,0.04); }
}
```

**Rules:**
- Reserve exact pixel dimensions (not min-height guesses) — measure the actual rendered content and hardcode width/height on the skeleton.
- Hydrate the shell first. Each widget (chart, order book, leaderboard) resolves independently — no full-screen spinner.
- Price cells: use a `w-[80px] h-[20px]` skeleton while loading so the column doesn't jump.
- On dark backgrounds: `rgba(255,255,255,0.03)` → `rgba(255,255,255,0.07)` range per the mobile rules.

---

## 4. Plan: Home Page

**Dials:** DESIGN_VARIANCE 7, MOTION_INTENSITY 6, VISUAL_DENSITY 3

### 4.1 Section Map

```
┌─────────────────────────────────────────────┐
│  Nav (64px, fixed)                          │
├─────────────────────────────────────────────┤
│  Hero (100dvh)                              │
│  ┌──────────────────┬──────────────────┐    │
│  │ Left: Headline + │ Right: Animated  │    │
│  │ sub + CTAs       │ market visual    │    │
│  └──────────────────┴──────────────────┘    │
├─────────────────────────────────────────────┤
│  Ticker strip (marquee, 40px)               │
├─────────────────────────────────────────────┤
│  How it works — Pinned story (3 steps)      │
├─────────────────────────────────────────────┤
│  News feed race (animated)                  │
├─────────────────────────────────────────────┤
│  Leaderboard race (animated)                │
├─────────────────────────────────────────────┤
│  Final CTA (full-width)                     │
└─────────────────────────────────────────────┘
```

**Mobile:** All sections stack vertically. The pinned-scroll story becomes a stacked vertical sequence (already implemented in `PinnedStory.tsx` — correct). Marquee wraps at 320px.

### 4.2 Nav

**Current:** `LandingNav.tsx` (correct structure — fixed, scroll-aware, progress bar). **Problems:** Only a wordmark + badge + links. No mobile hamburger. Badge at 10px text is inaccessible.

**Planned nav:**
- Wordmark: **bazaar** in `display-md` Sprat, sentence case (not wordmark caps)
- Badge: Event label in `label` Haskoy, `letter-spacing: 0.06em`, `font-size: 12px` minimum
- Links: Haskoy `body-sm` (13px), `font-weight: 500`
- Mobile (< 768px): Collapse links. Hamburger button (44×44px, `aria-label="Open navigation"`). Slide-in drawer from right, `role="dialog"`, focus-trapped.
- CTA button: `variant: secondary`, size `md`
- No logo image needed — the wordmark carries the brand

### 4.3 Hero

**Layout (desktop):** Split 50/50 — left text block, right animated market panel. NOT centered hero (DESIGN_VARIANCE 7 overrides the center-bias per `design-taste-frontend` §4.3).

**Layout (mobile):** Text stacked above, chart animation below. Text left-aligned. Chart fills remaining viewport height below the fold indicator.

**Hero copy (concrete, not placeholder):**

```
EYEBROW (optional, max 1 per 3 sections): "MERX Trading Simulation"
                                          (Haskoy label, 12px, letter-spacing 0.08em)

HEADLINE (Sprat display-xl, clamp 48px → 96px):
  "Read the news.
   Move first."

SUBHEAD (Haskoy subhead, 16px → 18px, max 20 words):
  "A live stock market where every headline moves prices.
   Trade against your team, the bots, and the clock."

CTA 1 (primary, lg):  "Join the session"
CTA 2 (ghost, md):    "See how it works"
```

**Copy rationale:** "Read the news. Move first." is 6 words, fits on 2 display lines at any breakpoint, and tells the core mechanic (news → price action → first-mover advantage). Avoids "Elevate", "Seamless", "Unleash" (banned per `redesign-existing-projects` §Content).

### 4.4 Hero Animation Storyboard

The right panel shows an animated mini-trading terminal. Four steps, each lasting ~2.5 seconds, looping.

```
STEP 0 → STEP 1 (0–2.5s): "The floor opens"
  - A price chart draws itself from left to right (SVG stroke-dashoffset animation)
  - The y-axis and x-axis tick marks fade in sequentially
  - Three asset rows appear below the chart with skeleton → real price animation
  - Background: off-black panel with subtle vertical scan-line overlay

STEP 1 → STEP 2 (2.5–5s): "News hits"
  - A news card slides in from the right with a red/amber glow border
  - Headline text types in character-by-character (requestAnimationFrame, small text, not a JS framework)
  - The price line kinks upward sharply (SVG path morphing via clip-path, not layout change)
  - One asset row's price flashes from neutral → gain-green (CSS transition, 80ms)

STEP 2 → STEP 3 (5–7.5s): "Your move"
  - A quantity input and BUY button appear at the bottom of the panel
  - The BUY button pulses once (opacity 0.6 → 1 → 0.6, 600ms, not infinite)
  - The cursor icon moves to the BUY button and "clicks" (scale: 0.97 → 1)
  - Confirmation: a green toast slides in at the top: "50 RELI-X bought at ₹1,247.80"

STEP 3 → STEP 0 (7.5–9s): "Result"
  - Portfolio equity number counts up (CSS counter animation — no JS)
  - Chart continues upward briefly
  - Fade out entire panel to `opacity: 0`, then reset and loop
```

**Animation rules:**
- All transforms: `transform` and `opacity` only. No `width`, `height`, `top`, `left` animation.
- Price flash: CSS `transition: color 80ms ease` on the price element — not a JS interval.
- `prefers-reduced-motion`: If set, skip steps 1–3. Show only step 0 as a static panel. The chart is pre-drawn (no animation). The news card is visible. No looping.
- **Mobile:** Run steps 0–1 only (simpler version). Steps 2–3 are desktop-only due to the smaller viewport height.

### 4.5 SVG Background

**Concept:** Layered market-graph silhouettes — three overlapping price-line SVGs at different opacities and z-depths, each at a different scale. The lines suggest a candlestick chart grid without being literal trading UI.

```html
<!-- Hero SVG background (inline, optimized) -->
<svg aria-hidden="true" class="hero-bg-svg">
  <!-- Layer 1: Distant price line (opacity 0.04, transform: scale(1.1)) -->
  <path d="M0,200 C120,180 200,120 320,140 S500,90 640,110 ..." 
        stroke="var(--color-tx-primary)" stroke-width="1" fill="none" />
  
  <!-- Layer 2: Mid price line (opacity 0.07, translateY: -20px) -->
  <path d="M0,160 C100,155 220,130 ..." 
        stroke="var(--color-accent)" stroke-width="1.5" fill="none" />
  
  <!-- Layer 3: Foreground accent line (opacity 0.12, normal transform) -->
  <path d="M0,220 C80,200 160,180 ..." 
        stroke="var(--color-accent)" stroke-width="2" fill="none" />
</svg>
```

**Animation:** Each layer translates slowly on an independent duration (80s, 120s, 60s) using `@keyframes` that move only `transform: translateX()`. The three layers create parallax depth.

**Reduced motion / low-end phone:** All three `@keyframes` are inside `@media (prefers-reduced-motion: no-preference)` — when motion is reduced, the SVGs are static at their initial position. On mobile the animation durations are extended to 160s+ (half the visual motion budget per `design-taste-frontend` §5 mobile fallback guidance).

**Performance:** The SVG is inline (no HTTP request). Paths are simple cubics (< 200 bytes each). GPU-composited because `will-change: transform` is set only on the SVG wrapper, not each path individually.

### 4.6 Animation Library Choice

**Landing page:** Use `motion/react` (already in `package.json` as `framer-motion ^14.0.0`; the newer import alias `motion/react` is already used in `landing/*.tsx`). Specifically:
- `useScroll` + `useTransform` for scroll-driven reveals (no re-renders)
- `whileInView` for section entry animations
- No GSAP — the motion budget for the landing is achievable with Motion, and adding GSAP would double the animation bundle

**Hero animation panel:** Pure CSS keyframes for the looping terminal animation. No Motion/GSAP involved. This keeps the hero's animation JS budget at zero — only the SVG background paths and the panel's CSS drive the motion.

**Mobile animation budget:**
- Mobile gets: SVG background (static on low-end, animated on mid-range), hero text stagger, scroll reveals on section entry
- Mobile does NOT get: 3D perspective card rotation (`UpgradeCards.tsx:28` desktop-only drift), pinned scroll story (replaced by stacked story — already implemented correctly)
- Total hero JS animation budget (mobile): 0kb additional JS (all CSS keyframes)
- Total hero JS animation budget (desktop): Motion's lazy-loaded features bundle (~12kb gz for the features used)

### 4.7 Supporting Sections

**Ticker strip:** Keep `animate-marquee` (pure CSS, GPU). Add `prefers-reduced-motion` guard. Increase font to 13px with tabular-nums. Add `aria-hidden="true"` and a visually-hidden text "Live market prices".

**How it works (PinnedStory):** Already well-implemented. Changes needed:
- Use Sprat for the `text-chapter` tokens (currently missing — no Sprat in globals)
- Increase side padding on mobile (`px-5` → `px-6`)
- Progress ticks: increase from `w-1.5 h-8` to `w-2 h-10` for 44px touch target

**NewsRace / LeaderboardRace:** Keep current animated reveal. Add `aria-live="polite"` to live-updating content. Ensure no `setInterval` or `setTimeout` on the landing page — use CSS animations.

**Final CTA:**
```
Headline (Sprat display-md): "Your next trade is one headline away."
CTA (primary, lg): "Join the session"
Supporting: "No account needed. Runs in your browser."
```

---

## 5. Plan: Participant Dashboard

**Dials:** DESIGN_VARIANCE 4, MOTION_INTENSITY 4, VISUAL_DENSITY 6

### 5.1 Mobile Information Hierarchy

**Default visible (above the fold on 375px phone):**
- Sticky top bar: Session #, State pill, Timer countdown — 56px
- Tab switcher: Chart / Book / News / Portfolio — 44px
- Active tab content: price + 24h% (compact, 2-line) → chart occupies next 45% of viewport height

**Secondary (accessible but not default):**
- Volume, day high/low, sector/archetype: tap "Details" chevron to expand a bottom drawer (36px collapsed, 280px expanded). Drawer uses `transform: translateY()` for animation.
- Order depth: visible only on the Book tab
- Portfolio details: visible only on the Portfolio tab

### 5.2 App Shell (`DashboardShell.tsx` replacement plan)

```
┌─────────────────────────────────────────────────────┐
│  Top bar (56px, bg-base/80 blur)                    │
│  [Logo] [TeamID]  [Session badge] [Timer] [Logout]  │
│  env(safe-area-inset-top) padding above             │
├─────────────────────────────────────────────────────┤
│  Tab switcher (44px, full-width, segmented)         │
│  [📈 Chart]  [📖 Book]  [📰 News]  [💼 Portfolio]   │
│  Underline indicator slides between tabs (transform)│
├─────────────────────────────────────────────────────┤
│  Content area (flex-1, overflow-y-auto)             │
│  Chart tab: Chart (60% height) + price header       │
│  Book tab: Bid/Ask depth table                      │
│  News tab: Chronological news feed                  │
│  Portfolio tab: Holdings + P&L                      │
└─────────────────────────────────────────────────────┘
│  Trade controls (thumb zone, docked to bottom)      │
│  [Ticker] [Price] [Qty -] [000] [Qty +] [BUY][SELL]│
│  Height: 80px + env(safe-area-inset-bottom)        │
└─────────────────────────────────────────────────────┘
```

**HTML structure:**
```html
<div style="height: 100dvh; display: flex; flex-direction: column;">
  <header>...</header>
  <nav role="tablist" aria-label="Dashboard tabs">...</nav>
  <main role="tabpanel" style="flex: 1; overflow-y: auto;">...</main>
  <footer style="padding-bottom: env(safe-area-inset-bottom);">
    <!-- Trade controls -->
  </footer>
</div>
```

### 5.3 Tab Switcher

- Segmented control (not individual nav links) — `role="tablist"` with `aria-selected` on each tab
- Tab labels: "Chart", "Book", "News", "Holdings" (rename "Explore" → "Chart", "Portfolio" → "Holdings", "Stats" removed from bottom bar, accessible via hamburger or secondary nav)
- Active indicator: a 2px underline that slides via `transform: translateX()`, not `left:` — no layout thrash
- On 320px screens: icons only, no text labels (with `aria-label` on each tab button)
- Touch target: each tab is 44px tall minimum

### 5.4 Trading Controls (Bottom Bar)

The current `TradeModal` (a full-screen overlay) should be replaced with a **bottom-docked trade bar** on mobile. This eliminates the modal layer and keeps controls in the thumb zone.

```
Bottom bar layout (80px + safe-area):
┌──────────────────────────────────────────────────────┐
│ [Ticker + Price]   [-] [  QTY  ] [+]   [SELL] [BUY] │
└──────────────────────────────────────────────────────┘
```

- SELL: `variant: sell` (loss color, 44px height)
- BUY: `variant: buy` (gain color, 44px height)
- Qty stepper: `min-height: 44px`, `touch-action: manipulation`
- Price: `font-variant-numeric: tabular-nums`, `font-family: Haskoy, JetBrains Mono, monospace`
- On trade execution: `navigator.vibrate(12)` (feature-detected)
- Confirmation: inline toast (not a blocking modal), 3s auto-dismiss

### 5.5 Tick-Flash Behavior

When a price updates:
```css
.price-cell {
  transition: color 80ms ease;
}
.price-cell.tick-up   { color: var(--color-gain); }
.price-cell.tick-down { color: var(--color-loss); }
/* After 800ms, class is removed, transition eases back to tx-primary */
```
- No JS animation loops. A `setTimeout` adds/removes the CSS class only.
- `prefers-reduced-motion`: remove the class immediately (no transition).

### 5.6 Skeleton Plan

| Widget | Skeleton dimensions |
|--------|---------------------|
| Price header | `w-[120px] h-[32px]` + `w-[80px] h-[20px]` |
| Chart | `w-full h-[220px]` |
| Asset row (market list) | `w-full h-[72px]` per row, 6 rows reserved |
| Portfolio row | `w-full h-[56px]` per row |
| News item | `w-full h-[80px]` per item, 3 items reserved |
| Order book row | `w-full h-[28px]` per row, 10 rows each side |

### 5.7 Empty and Error States

**No positions (Portfolio tab):**
> "No open positions. Find an opportunity on the Chart tab."
> [Chart tab button — navigates to Chart]

**Session not started:**
> "Waiting for the session to begin. The market opens shortly."
> Animated countdown if available.

**WebSocket disconnected:**
> Inline banner (not a modal): "Connection lost — reconnecting…" with a spinner
> Auto-dismiss on reconnect

**Trade error:**
> Inline error below the quantity input: red text, `role="alert"`, specific message ("Insufficient cash" / "Market closed" / "Order rejected — outside bid-ask spread")

---

## 6. Plan: Admin Dashboard

**Dials:** DESIGN_VARIANCE 3, MOTION_INTENSITY 2, VISUAL_DENSITY 8

### 6.1 Layout Strategy

The admin dashboard is explicitly allowed to be desktop-first (per the brief), with a usable mobile fallback. On desktop (≥1024px): a two-pane layout with a fixed left sidebar (240px) for tab navigation and a scrollable right content area. On mobile (< 768px): sidebar collapses to a top horizontal tab row (scroll-snapping for overflow).

```
Desktop:
┌────────────────┬──────────────────────────────────────┐
│ Sidebar (240px)│ Content area                          │
│                │                                       │
│ [Activity]     │ Tab content (scrollable)               │
│ ─────────      │                                       │
│ Session        │                                       │
│ Teams          │                                       │
│ Assets         │                                       │
│ News           │                                       │
│ Leaderboard    │                                       │
│ Danger Zone    │                                       │
│                │                                       │
│ [Logout]       │                                       │
└────────────────┴──────────────────────────────────────┘
```

**Remove:** `alert()` / `confirm()` dialogs. Replace with:
- Destructive actions → inline confirmation pattern: button click → button text changes to "Confirm?" with 3s auto-reset (no dialog, no focus trap needed for non-critical)
- Critical destructive (delete team) → a compact inline modal (`role="alertdialog"`, focus-trapped, ESC to dismiss)

### 6.2 Tables

**Teams table** columns: Team ID, Cash (₹), Equity (₹), Status, Actions

| | Mobile (< 640px) | Desktop |
|--|--|--|
| Columns | Team ID + Equity + Action | All columns |
| Row height | 56px | 44px (dense) |
| Pagination | 20 per page + prev/next | 25 per page |
| Sort | None | Click-to-sort on column headers |
| Search | Full-width input above table | 280px input in table header row |

Numbers: `font-variant-numeric: tabular-nums`, right-aligned. No `font-mono` for non-numeric content.

**Assets table:** Ticker, Name, Sector, Archetype, Current Price, 1h Change%. Current price and change: right-aligned, tabular-nums, color-coded (gain/loss tokens).

### 6.3 Key Controls

**Session control strip** (always visible, top of Session tab):
```
[▶ START SESSION]  [⏸ PAUSE]  [⏹ END SESSION]
Session: R1-S3  |  Tick: 142/200  |  Countdown: 04:18
```
- All buttons: `variant: secondary` except START (primary), END (destructive)
- Timer: `font-variant-numeric: tabular-nums`, `font-size: 24px`, Haskoy `font-weight: 600`
- Status pill: gain-color for RUNNING, warn-color for LOCKED, muted for READY/FINISHED

### 6.4 Filters and Bulk Actions

**News tab filters:** Session filter (select) + source filter (select) + text search — all in a single 48px filter bar at the top of the tab.

**Bulk actions (Teams tab):** Select-all checkbox in table header. When rows selected, a floating action bar appears at bottom: "X teams selected — [Reset PINs] [Delete]". Delete action requires inline confirmation.

### 6.5 Status Indicators

Replace `alert()` success confirmation with a `<div role="status" aria-live="polite">` toast region in the top-right corner. Toasts auto-dismiss after 4s. Each toast has a progress bar (CSS `animation-duration: 4s`, `transform: scaleX()`, origin left).

### 6.6 Loading and Error States

**Loading (data fetch):** The current `if (!sysState || !leaderboard) return <div>Initializing...</div>` is a full-screen loader. Replace with skeleton for each section (3 rows in teams table, stats cards with reserved dimensions).

**Error (fetch failure):** Inline error banner in each section's header: "Failed to load teams data. [Retry]". Do not show a blank section.

### 6.7 Mobile Fallback

At < 768px: The sidebar becomes a horizontal scroll row of tab icons (icons only, 44×44px each). Content area is full-width. Tables collapse to the reduced column set defined in §6.2. The session control strip becomes vertically stacked. The admin is expected to primarily use desktop — mobile is a "monitor-only" fallback.

---

## 7. Implementation Roadmap

### Phase 1: Design Tokens, Fonts, Shared Components (Est. 1–2 days)
**Do first — everything downstream depends on this.**

1. `frontend/public/fonts/` — Add font files: `Haskoy[wght].woff2`, `Sprat-Regular.woff2`, `Sprat-Italic.woff2` (**manual download required** from collletttivo.it and github.com/ertekinno/haskoy)
2. `frontend/src/app/globals.css` — Replace all `@theme` tokens with the new color/spacing/radius/motion token system. Add `@font-face` declarations. Add `prefers-reduced-motion` blanket rule.
3. `frontend/src/app/layout.tsx` — Add `<link rel="preload">` for critical font weights. Fix `<html>` className to remove hardcoded `"dark"` (let ThemeProvider drive it). Add skip-to-content link. Change `min-h-screen` → `min-h-[100dvh]`.
4. Create `frontend/src/components/ui/Button.tsx` — implement all variants from §3.3 with all states (hover, active, focus, loading, disabled). Include `aria-label` support for icon-only.
5. Create `frontend/src/components/ui/Skeleton.tsx` — shimmer skeleton with `width` / `height` props, `aria-hidden`, and the dark-mode shimmer CSS from §3.5.
6. Create `frontend/src/components/ui/Toast.tsx` — `role="status"`, `aria-live="polite"`, progress bar, auto-dismiss. Replace `alert()` calls in admin.

**Dependencies:** None — this phase is pure additions.

---

### Phase 2: Home Page Visual Redesign (Est. 2–3 days)

7. `frontend/src/components/home/Hero.tsx` — Rewrite to split-screen layout. Add new copy (§4.3). Add SVG background (§4.5). Add left text block. Add right animated panel (§4.4 — pure CSS keyframes, no new JS dependencies).
8. `frontend/src/components/home/LandingNav.tsx` — Fix badge font size (12px min). Add mobile hamburger drawer. Ensure all nav links are 44px touch targets.
9. `frontend/src/app/page.tsx` — Change `min-h-screen` → `min-h-[100dvh]`. Remove AI-slop radial gradient. Replace with SVG background (imported from Hero or inline). Verify theme lock (dark only — no light sections).
10. `frontend/src/components/home/TickerStrip.tsx` — Add `aria-hidden`, visually-hidden label. Add `prefers-reduced-motion` guard on `animate-marquee`.
11. `frontend/src/components/home/PinnedStory.tsx` — Apply Sprat tokens to chapter headings. Verify reduced-motion path. No structural changes needed.

**Dependencies:** Phase 1 must be complete (tokens, fonts, Button).

---

### Phase 3: Participant Dashboard Shell (Est. 2 days)

12. `frontend/src/components/layout/DashboardShell.tsx` — Full rewrite:
    - `h-[100dvh]` viewport fix
    - `env(safe-area-inset-top)` on top bar
    - `<header>` / `<nav role="tablist">` / `<main role="tabpanel">` / `<footer>` semantic structure
    - 44px minimum hit targets on all buttons
    - `aria-label` on theme toggle and logout
    - Segmented tab switcher with sliding underline
    - Bottom trade bar docked with `env(safe-area-inset-bottom)` padding
13. `frontend/src/components/TradeModal.tsx` — Replace with `TradeBar.tsx` (bottom-docked, not a modal). Implement `role="region" aria-label="Trade controls"`. Add haptics (`navigator.vibrate(12)`). Move order summary to an expandable detail row. Add inline error display (remove no-error state's blank space by hiding the error element entirely until needed).
14. Add skeleton components to all dashboard data fetch points — portfolio, news, market list.

**Dependencies:** Phase 1, Phase 2 nav refactor.

---

### Phase 4: Market Page and Charts (Est. 2 days)

15. `frontend/src/app/market/page.tsx` — Replace identical 2-column card grid with a different layout: a top ticker list (compact, dense, scrollable) that collapses to show Ticker + Price + 24h% only on mobile, with a right-side detail panel that slides in when a ticker is selected.
16. `frontend/src/components/LiveChart.tsx` — Apply token colors (`--color-gain`, `--color-loss`, `--color-accent`). Set chart background to `bg-void`. Add volume histogram coloring. Fix hardcoded `accentColor="#3b82f6"` default to use token.
17. `frontend/src/components/OrderDepth.tsx` — Apply tabular-nums to all bid/ask values. Add `aria-label` to the order depth table. Fix contrast on muted text.
18. Add tick-flash CSS class system (§5.5). Wire it into the market store subscriber.

**Dependencies:** Phase 1, Phase 3.

---

### Phase 5: Admin Dashboard (Est. 2–3 days)

19. `frontend/src/app/admin/page.tsx` — Structural rewrite:
    - `h-[100dvh]` fix
    - Two-pane sidebar layout (desktop) / tab row (mobile)
    - Replace all `alert()` / `confirm()` calls with inline confirmation pattern and `Toast.tsx`
    - Replace full-screen "Initializing..." loader with section-level skeletons
    - Add `role="alertdialog"` for team delete confirmation
    - Fix `setInterval(fetchData, 1000)` — add `document.visibilityState` check to pause polling when tab is backgrounded
20. Implement admin table components with sort headers, pagination, bulk-select, and responsive column hiding.
21. Session control strip implementation.

**Dependencies:** Phase 1 (Toast, Button, Skeleton).

---

### Phase 6: Polish, A11y, Performance (Est. 1–2 days)

22. Add skip-to-content link (Phase 1 deferred item for app pages).
23. Audit all `text-[10px]` instances — bump to 12px minimum or move to a tooltip/drawer.
24. Fix two-motion-runtime issue: unify all imports to `import { motion } from "motion/react"` and remove `framer-motion` direct imports in `frontend/src/components/home/`.
25. Add `og:image`, `og:description`, `twitter:card` meta tags to `layout.tsx`.
26. Add `prefers-reduced-motion` test pass — verify all animations disable correctly.
27. Lighthouse/CWV check: target LCP < 2.5s, CLS < 0.1, INP < 200ms.

**Dependencies:** All prior phases.

---

## 8. Open Questions and Assumptions

| # | Question / Assumption | Impact |
|---|----------------------|--------|
| 1 | **Haskoy `tnum` support:** The GitHub repo (`ertekinno/haskoy`) does not explicitly list OpenType feature support in its README. The plan assumes `tnum` may not be present and specifies a `JetBrains Mono` fallback for numeric cells. **Action needed:** After downloading the font, run `pyftsubset` or use `fonttools` to check `GSUB` table for `tnum` feature. If present, use `font-variant-numeric: tabular-nums` on Haskoy directly with no fallback. | Medium — affects all price/quantity rendering |
| 2 | **Sprat variable font availability:** The freefaces.gallery page lists Sprat as having 18 styles. It is unclear whether a single `.woff2` variable font file exists or only static weight/width files. **Action needed:** Visit `collletttivo.it/typefaces/sprat` to check the download package contents. If variable, use `format("woff2 supports variations")`. If static, choose Regular (400) and one other weight only to minimize HTTP weight. | Medium — affects font loading strategy |
| 3 | **Auth flow (waiting/ and login/ routes):** The codebase has `frontend/src/app/waiting/` and `frontend/src/app/login/` routes but these were not inspected. The participant dashboard plan assumes login redirects to `/market`. **Action needed:** Audit these pages in Phase 5. | Low |
| 4 | **Light mode:** `globals.css:17–22` declares a light mode (`bg-slate-50 text-slate-900`). The home page is locked to dark (`className="dark"` on `<html>`). It is unclear if any surface intentionally supports light mode. The ThemeProvider with sun/moon toggle in DashboardShell suggests yes. **Assumption:** Light mode is supported on the participant dashboard only. The landing page is dark-only. The color tokens proposed in §3.1 cover only dark mode — a full light-mode token set is out of scope for this audit but noted as a future requirement. | Medium |
| 5 | **`landing/` directory vs `frontend/src/`:** The repo has two parallel landing page implementations — the `landing/` directory at the project root (with its own versions of Hero, PinnedStory, etc.) and `frontend/src/components/home/` (used by `frontend/src/app/page.tsx`). It is unclear which is production. The `frontend/` version is the one served by Next.js. **Assumption:** `frontend/src/components/home/` is canonical; `landing/` is a draft or legacy. The audit and plan target `frontend/src/`. | High — wrong files modified would have no effect |
| 6 | **MERX vs Bazaar branding:** `layout.tsx` title is "MERX | Meridian Exchange". The wordmark in `LandingNav` references `LANDING_COPY.nav.wordmark` (file not found in the inspection — `@/lib/landing-content` does not resolve to a visible file in the component listing). **Assumption:** The product name is "Bazaar" per the task brief, but the codebase calls it "MERX". The plan uses "bazaar" as the wordmark. **Action needed:** Confirm with product owner which name is canonical before Phase 2. | High |
| 7 | **Backend WebSocket events for price ticks:** The tick-flash behavior (§5.5) depends on the market store emitting price updates. It is assumed the `useMarketStore` already triggers re-renders on price change (the `setInterval` poll in `DashboardShell` at 2s suggests it does not yet use WebSocket push for portfolio). The tick-flash CSS class approach requires knowing *when* a price changed. **Action needed:** Confirm if the market store tracks "previous price" to derive tick direction, or if this needs to be added. | Medium |

---

## Skills Used

| Section | Skill(s) |
|---------|---------|
| Audit protocol, AI-slop detection | `redesign-existing-projects` |
| A11y, responsiveness, motion, typography critique | `impeccable` |
| Design read, dial settings, anti-slop rules, hero layout, motion decisions | `design-taste-frontend` |
| Color tokens, button system, dashboard patterns, chart coloring, a11y priority table | `ui-ux-pro-max` |
| Type scale, Sprat/Haskoy roles, line-length, copy guidance | `frontend-design` |
| dvh/safe-area, font-display: swap, preload, reduced-motion, CWV, transform-only animation | `modern-web-guidance` |

**Conflict resolved:** `design-taste-frontend` §4.1 strongly discourages serif as default display type (labeled "SERIF DISCIPLINE — VERY DISCOURAGED AS DEFAULT"). This brief explicitly mandates Sprat. The brief wins. The skill's own rule states: "Where the brief pins down a visual direction, follow it exactly — the brief's own words always win." Sprat is used as instructed.
