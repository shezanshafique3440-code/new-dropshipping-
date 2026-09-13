# Aurelia — Storefront Foundation

A premium dropshipping storefront built with Next.js (App Router), TypeScript
and Tailwind CSS.

> **Status: Step 1 — foundation only.**
> Routing, design tokens, layout shell and shared UI primitives are in place.
> Catalogue, cart logic, checkout, payments, auth, admin and supplier
> integrations are deliberately **not** implemented yet — each lands in its own
> step.

## Getting started

```bash
npm install
cp .env.example .env.local   # adjust values as needed
npm run dev                  # http://localhost:3000
```

## Scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Development server                        |
| `npm run build`     | Production build                          |
| `npm run start`     | Serve the production build                |
| `npm run lint`      | ESLint (`eslint-config-next`, flat config) |
| `npm run lint:fix`  | ESLint with autofix                       |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm run check`     | Lint + typecheck                          |

## Project structure

```
src/
├── app/                    # App Router routes and route-level states
│   ├── layout.tsx          # Root layout: fonts, metadata, header/footer shell
│   ├── page.tsx            # /
│   ├── loading.tsx         # Route loading skeleton
│   ├── error.tsx           # Route error boundary
│   ├── global-error.tsx    # Root layout error boundary
│   ├── not-found.tsx       # Custom 404
│   ├── shop/page.tsx       # /shop
│   ├── cart/page.tsx       # /cart
│   ├── account/page.tsx    # /account
│   └── contact/page.tsx    # /contact
├── components/
│   ├── layout/             # Shell composition (server-first)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── NavLink.tsx     # client — active-route highlighting
│   │   ├── MobileMenu.tsx  # client — small-screen drawer
│   │   ├── PageHeader.tsx
│   │   └── PlaceholderPanel.tsx
│   └── ui/                 # Design-system primitives
│       ├── Button.tsx      # Button + ButtonLink + buttonStyles()
│       ├── Card.tsx        # Card + Header/Title/Description/Content/Footer
│       ├── Container.tsx
│       └── SocialIcon.tsx
├── config/site.ts          # Store name, description, currency, nav, socials
├── hooks/useLockBodyScroll.ts
├── lib/
│   ├── env.ts              # Typed public env access
│   ├── format.ts           # formatPrice / formatDate
│   └── utils.ts            # cn() class joiner
├── styles/globals.css      # Tailwind entry, design tokens, utilities
└── types/index.ts          # Shared types
public/
├── icons/
└── images/
```

Everything under `src/` is reachable through the `@/*` path alias.

## Design system

Tailwind CSS v4 is configured entirely in `src/styles/globals.css` — there is no
`tailwind.config.js`.

- **Tokens** — brand/accent/highlight ramps plus semantic tokens
  (`background`, `surface`, `foreground`, `border`, `primary`, …) declared as
  CSS custom properties and exposed to Tailwind through `@theme inline`.
- **Theming** — light by default, dark via `prefers-color-scheme`, overridable
  by setting `data-theme="light" | "dark"` on `<html>`. The `dark:` variant is
  wired to both conditions.
- **Utilities** — `container-page` (global container), `section-y` (vertical
  rhythm), `glass` (glassmorphism surface), `text-gradient-brand`.
- **Motion** — `--ease-out-soft` easing and a `fade-up` animation, with a
  `prefers-reduced-motion` guard in the base layer.

These primitives exist so later steps can add vibrant gradients, glass panels,
product hover effects and animated sections without reworking the foundation.

## Configuration

`src/config/site.ts` is the single source of truth for the store name,
description, currency, navigation and social links — no duplicated literals in
components.

Environment variables are documented in `.env.example`. Only `NEXT_PUBLIC_*`
values are read today; secrets arrive with the features that need them and must
never be committed or exposed to the client bundle.

## Conventions

- TypeScript strict mode, plus `noUncheckedIndexedAccess`, `noUnusedLocals` and
  `noUnusedParameters`. No `any`.
- Server Components by default; `"use client"` only where interaction requires
  it (`NavLink`, `MobileMenu`, error boundaries).
- Semantic, accessible markup: landmarks, labelled navigation, skip link,
  visible focus rings, `aria-current` on the active route.
- Responsive from the smallest breakpoint up.
