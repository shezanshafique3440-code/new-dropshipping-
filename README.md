# ZYVERO — Storefront Foundation

*Discover. Choose. Enjoy.*

A premium international storefront built with Next.js (App Router), TypeScript
and Tailwind CSS.

> **Status: Step 2 — visual identity and design system.**
> Routing, design tokens, the ZYVERO brand system and the shared UI primitives
> are in place. Catalogue, cart logic, checkout, payments, auth, admin and
> supplier integrations are deliberately **not** implemented yet — each lands in
> its own step.

## Getting started

```bash
npm install
cp .env.example .env.local   # adjust values as needed
npm run dev                  # http://localhost:3000
```

## Scripts

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Development server                         |
| `npm run build`     | Production build                           |
| `npm run start`     | Serve the production build                 |
| `npm run lint`      | ESLint (`eslint-config-next`, flat config) |
| `npm run lint:fix`  | ESLint with autofix                        |
| `npm run typecheck` | `tsc --noEmit`                             |
| `npm run check`     | Lint + typecheck                           |

## Project structure

```
src/
├── app/                        # App Router routes and route-level states
│   ├── layout.tsx              # Root layout: fonts, metadata, app shell
│   ├── page.tsx                # /
│   ├── loading.tsx             # Route loading skeleton
│   ├── error.tsx               # Route error boundary
│   ├── global-error.tsx        # Root layout error boundary
│   ├── not-found.tsx           # Custom 404
│   └── shop|cart|account|contact/page.tsx
├── components/
│   ├── brand/                  # Brand identity
│   │   ├── Wordmark.tsx        # Text-based ZYVERO wordmark + monogram
│   │   └── BrandShowcase.tsx   # Decorative hero composition
│   ├── layout/                 # Shell composition (server-first)
│   │   ├── Header.tsx          # Sticky glass header
│   │   ├── AnnouncementBar.tsx
│   │   ├── SearchTrigger.tsx   # Search placeholder
│   │   ├── MobileMenu.tsx      # client — drawer
│   │   ├── NavLink.tsx         # client — active-route highlighting
│   │   ├── Footer.tsx
│   │   ├── NewsletterSignup.tsx
│   │   ├── PageHeader.tsx
│   │   └── PlaceholderPanel.tsx
│   └── ui/                     # Design-system primitives
│       ├── Button.tsx          # 6 variants + ButtonLink + buttonStyles()
│       ├── Card.tsx            # 5 variants + interactive/glow
│       ├── Badge.tsx           # merchandising and status pills
│       ├── Container.tsx
│       ├── Icon.tsx            # inline UI glyph set
│       └── SocialIcon.tsx
├── config/site.ts              # Brand, currency, nav, announcement, socials
├── hooks/useLockBodyScroll.ts
├── lib/                        # env.ts, format.ts, utils.ts
├── styles/globals.css          # Tokens, theme mapping, utilities
└── types/index.ts
public/images  public/icons
```

Everything under `src/` is reachable through the `@/*` path alias.

## Design system

Tailwind CSS v4 is configured entirely in `src/styles/globals.css` — there is no
`tailwind.config.js`. The file is ordered: palette → semantic tokens (light) →
semantic tokens (dark) → `@theme inline` mapping → base layer → utilities.

**Palette** — violet (primary), blue (secondary), cyan (accent), magenta
(highlight, used sparingly) and a cool navy neutral ramp.

**Semantic tokens**

| Group     | Tokens                                                                              |
| --------- | ----------------------------------------------------------------------------------- |
| Brand     | `brand-primary`, `brand-secondary`, `brand-accent`, `brand-highlight`, `*-soft`, `brand-fill` |
| Surfaces  | `background`, `surface`, `surface-elevated`, `surface-muted`, `surface-glass`, `surface-inverse` |
| Text      | `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-inverse`          |
| Borders   | `border`, `border-subtle`, `border-strong`, `border-highlight`                       |
| Feedback  | `success`, `warning`, `danger`, `info`                                               |
| Effects   | `shadow-soft`, `shadow-card`, `shadow-floating`, `shadow-glow-primary`, `shadow-glow-accent` |

`brand-fill` is deliberately separate from `brand-primary`: the fill stays at a
luminance that keeps white button text at WCAG AA in **both** themes, while
`brand-primary` brightens in dark mode for accents and focus rings.

**Typography** — fluid `clamp()` scale: `type-display`, `type-h1`, `type-h2`,
`type-h3`, `type-body-lg`, `type-body`, `type-caption`, `type-eyebrow`, on the
Geist family.

**Gradients** — `gradient-brand` (blue → violet → magenta), `gradient-accent`
(blue → cyan), `gradient-hero` (multi-colour mesh), `gradient-surface` (subtle
tint), `text-gradient-brand`, `text-gradient-accent`, and `gradient-border` for
a masked 1px gradient outline.

**Effects** — `glass` (frosted panel), the shadow/glow scale above.

**Motion** — `animate-fade`, `animate-fade-up`, `animate-fade-down`,
`animate-scale-in`, `animate-slide-in`, `animate-float-soft`, plus `hover-lift`,
`hover-zoom` and `link-underline`. Easing tokens: `--ease-out-soft`,
`--ease-out-expo`, `--ease-in-out-soft`. Decorative motion is switched off under
`prefers-reduced-motion`.

**Layout** — `container-page` (global container and gutters), `section-y`,
`section-y-sm`.

**Theming** — light by default, dark via `prefers-color-scheme`, overridable by
setting `data-theme="light" | "dark"` on `<html>`. The `dark:` variant is wired
to both conditions. Dark mode is designed, not inverted: deep navy surfaces with
brighter brand hues.

## Configuration

`src/config/site.ts` is the single source of truth for the store name, tagline,
description, currency, navigation, announcement strip, newsletter copy and
social links — no duplicated literals in components.

Environment variables are documented in `.env.example`. Only `NEXT_PUBLIC_*`
values are read today; secrets arrive with the features that need them and must
never be committed or exposed to the client bundle.

## Conventions

- TypeScript strict mode, plus `noUncheckedIndexedAccess`, `noUnusedLocals` and
  `noUnusedParameters`. No `any`.
- Server Components by default; `"use client"` only where interaction requires
  it (`NavLink`, `MobileMenu`, error boundaries).
- Semantic, accessible markup: landmarks, labelled navigation, skip link,
  visible focus rings, `aria-current`, `inert` on the closed drawer.
- Responsive from 320px up; no horizontal overflow at any width.
