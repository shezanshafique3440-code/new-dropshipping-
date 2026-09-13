# ZYVERO — Storefront Foundation

*Discover. Choose. Enjoy.*

A premium international storefront built with Next.js (App Router), TypeScript
and Tailwind CSS.

> **Status: Step 8 — persistent orders (PostgreSQL + Prisma).**
> Foundation, design system, homepage, catalogue, cart, checkout, Stripe
> payments and durable order storage are in place. Payment runs through Stripe
> Checkout and is expected to be in **test mode**: a live key is refused unless
> the deployment explicitly opts in (see [Payments](#payments-stripe)).
> Fulfilment, tax, transactional email, customer accounts and order history,
> admin tooling and supplier integrations are deliberately **not** implemented
> yet — each lands in its own step.

## Getting started

```bash
npm install                  # also runs `prisma generate`
cp .env.example .env.local   # fill in DATABASE_URL and Stripe test keys
npm run db:migrate           # create the order tables
npm run dev                  # http://localhost:3000
```

A PostgreSQL database is required from Step 8 onwards — see
[Database](#database-postgresql--prisma).

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
| `npm run db:generate` | Regenerate the Prisma client             |
| `npm run db:migrate`  | Create and apply a migration (development) |
| `npm run db:deploy`   | Apply existing migrations (deployment)   |
| `npm run db:status`   | Show which migrations have been applied  |

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
│   ├── shop|cart|account|contact/page.tsx
│   ├── checkout/page.tsx       # Checkout flow
│   ├── checkout/success/       # Stripe return: verifies before confirming
│   └── api/
│       ├── checkout/create-session/route.ts
│       ├── checkout/session-status/route.ts
│       └── webhooks/stripe/route.ts
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
├── lib/                        # env, format, money, cart, checkout, catalog, routes
├── server/                     # server-only: never imported by a client component
│   ├── db/                     # Prisma client singleton + connection config
│   ├── orders/                 # order domain: repository, adapters, transitions, service
│   ├── payments/               # Stripe client, config, validation, session, orders
│   └── rate-limit.ts
├── styles/globals.css          # Tokens, theme mapping, utilities
└── types/index.ts
prisma/
├── schema.prisma               # Order, OrderItem, ProcessedWebhookEvent
└── migrations/                 # Committed, applied in order
prisma.config.ts                # Where the Prisma CLI reads DATABASE_URL
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

## Database (PostgreSQL + Prisma)

Orders are the first thing in this project that has to outlive a request, so
they live in PostgreSQL. Everything else — the catalogue, the cart — is still
static data or browser state.

### Local setup

```bash
# 1. A database and a role for it (adjust to taste; any PostgreSQL 14+ works)
createdb zyvero_dev
psql -c "CREATE ROLE zyvero LOGIN PASSWORD 'choose-a-password'; ALTER ROLE zyvero CREATEDB;"
psql -c "ALTER DATABASE zyvero_dev OWNER TO zyvero;"

# 2. Point the app at it — in .env.local, never in the repository
DATABASE_URL="postgresql://zyvero:choose-a-password@127.0.0.1:5432/zyvero_dev?schema=public"

# 3. Create the tables
npm run db:migrate
```

`ALTER ROLE … CREATEDB` is only needed in development: `prisma migrate dev`
creates a temporary shadow database to verify migrations. Production
deployments run `npm run db:deploy`, which needs no such permission.

### Migrations

| Situation                      | Command                                    |
| ------------------------------ | ------------------------------------------ |
| Changed `prisma/schema.prisma` | `npm run db:migrate` (writes and applies)  |
| Deploying                      | `npm run db:deploy` (applies only)         |
| Checking a deployment          | `npm run db:status`                        |
| After pulling someone's change | `npm run db:generate && npm run db:deploy` |

`prisma migrate reset` drops everything and must never be pointed at a
database holding real orders. Migrations are committed to the repository and
applied in order, so any environment can be rebuilt from them.

Two migrations exist: the initial tables, and a second one adding the CHECK
constraints Prisma's schema language cannot express (non-negative money,
positive quantities, `lineAmount = unitAmount × quantity`, and the shape of
the public order reference).

### Models

| Model                   | What it holds                                                    |
| ----------------------- | ---------------------------------------------------------------- |
| `Order`                 | One paid-for basket: reference, statuses, amounts, customer, address, Stripe ids, timestamps |
| `OrderItem`             | An immutable snapshot of one purchased line                       |
| `ProcessedWebhookEvent` | Stripe event ids already handled, so a retry cannot be processed twice |

Money is stored as integers in minor units (cents). No monetary value is ever
a float, in the database or in the application.

Order items are snapshots on purpose. `name` and `unitAmount` are copied at
purchase time and never read back from the catalogue, so renaming or
repricing a product cannot rewrite what an old order says was bought.

### Order status and payment status

They are separate columns because they answer different questions.

| `status`    | Meaning                                            |
| ----------- | -------------------------------------------------- |
| `pending`   | Recorded, payment not settled yet                   |
| `paid`      | Payment confirmed by Stripe                         |
| `cancelled` | Ended deliberately; terminal                        |
| `failed`    | A payment attempt failed; can still recover to paid |

| `paymentStatus` | Meaning                          |
| --------------- | -------------------------------- |
| `unpaid`        | No money has arrived              |
| `paid`          | Money arrived                     |
| `failed`        | An attempt was declined           |
| `refunded`      | Money was sent back               |

Every change goes through `src/server/orders/transitions.ts`. Nothing else
writes a status: illegal moves (a paid order back to pending, a cancelled
order to paid) are rejected rather than silently applied.

### How a payment becomes an order

```
Stripe Checkout → payment
  ├── POST /api/webhooks/stripe   (signature verified — the authority)
  └── GET  /api/checkout/session-status  (the returning browser)
        ↓ both call the same code path
      order service → repository → PostgreSQL
```

Whichever arrives first creates the order; the other finds it. This holds
because the database enforces it, not because the code checks first:

- `orders.stripeCheckoutSessionId` is **unique** — a second insert for the
  same payment is rejected, caught, and turned into "you already have it";
- payment is applied with a single conditional `UPDATE`, so two concurrent
  confirmations cannot both stamp it;
- `processed_webhook_events` has the event id as its **primary key** — the
  first insert wins and every retry stands down.

None of it depends on process memory, so several instances behind a load
balancer behave the same as one.

### Security notes

- `DATABASE_URL` is server-only. A `NEXT_PUBLIC_DATABASE_URL` would be
  compiled into the browser bundle, so the app refuses to start if one exists.
- Database errors are converted into generic messages before they leave the
  server: no SQL, no connection string, no Prisma internals, no stack traces.
- Responses are shaped by hand (`toPublicOrder`), never a serialised database
  row: the browser sees a reference, amounts and line names, and never an
  internal id, a Stripe id or a shipping address.
- The public reference (`ZYV-XXXXXX`) exists precisely so the primary key
  never has to be shown. It comes from a CSPRNG, so it cannot be enumerated
  the way a sequential id can.
- There is no "fetch an order by id" endpoint. Until customer accounts exist,
  the only way to see an order is to hold the Stripe session that paid for it.
- No card number, CVC or expiry is stored — none of it ever reaches this
  application in the first place.

### Current limitations

- Orders can only be read back through the payment session that created them;
  authenticated order history arrives with customer accounts.
- Refunds are modelled (`refunded`) but nothing issues one yet.
- Shipping is charged at zero, tax is not calculated, and no order email is
  sent. See the Stripe section below.

## Payments (Stripe)

Payment is taken by **Stripe Checkout**, Stripe's own hosted payment page.
Card number, expiry and CVC are entered on Stripe's domain and never reach this
application, which is the whole reason for choosing Checkout over Elements.

### Flow

```
Cart → /checkout → POST /api/checkout/create-session
     → Stripe Checkout (hosted)  → payment
     → /checkout/success?session_id=…  → GET /api/checkout/session-status  (verifies)
     → POST /api/webhooks/stripe        (authoritative confirmation)
     → order created exactly once → cart cleared
```

The browser's return trip is **never** treated as proof of payment. Both the
success page and the webhook ask Stripe what happened and go through the same
`recordOrderForSession`, which upserts on the Checkout Session id — so one
payment produces exactly one order however many times either arrives.

Prices are never taken from the browser. The session endpoint accepts product
ids and quantities only, then resolves every price from the catalogue
(`findProductById`) and computes totals in integer minor units (`src/lib/money.ts`).

### Environment variables

Copy `.env.example` to `.env.local` and fill in **test** keys from
<https://dashboard.stripe.com/test/apikeys>:

| Variable                 | Where it is read | Notes                                              |
| ------------------------ | ---------------- | -------------------------------------------------- |
| `STRIPE_SECRET_KEY`      | server only      | `sk_test_…` while testing. Never exposed to the client. |
| `STRIPE_WEBHOOK_SECRET`  | server only      | `whsec_…`, from the webhook endpoint or the CLI.   |
| `STRIPE_ALLOW_LIVE_MODE` | server only      | Must be `true` before a `sk_live_…` key is accepted. |
| `NEXT_PUBLIC_SITE_URL`   | server + client  | Origin used to build Stripe's return URLs.         |

No publishable key is needed: the browser is redirected to the URL Stripe
returns, so no Stripe JavaScript runs on our pages.

### Local webhook testing

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_… into STRIPE_WEBHOOK_SECRET, then restart the dev server
```

`stripe trigger checkout.session.completed` replays an event; deliveries with a
bad or missing signature are rejected with 400.

### Testing a payment

Use Stripe's published [test cards](https://docs.stripe.com/testing) — for
example the standard success card, the `4000 0000 0000 9995` decline, and the
`4000 0025 0000 3155` 3-D Secure card. No test card number is hardcoded in this
repository or shown in the UI, and real cards must never be used against test
keys.

### Going live

1. Provide live keys (`sk_live_…`, and a live-mode `whsec_…` for the deployed
   webhook endpoint).
2. Set `STRIPE_ALLOW_LIVE_MODE=true` — without it the server refuses to start a
   payment, so a live key can never be picked up by accident.
3. Point `NEXT_PUBLIC_SITE_URL` at the production origin.
4. Point `DATABASE_URL` at the production database and run `npm run db:deploy`
   as part of the release.

### Deliberately not implemented

Shipping is charged at **zero** and stated as such — there is no fulfilment
integration to price it. `automatic_tax` is **off** and no tax rate is invented.
There is no transactional email, so the confirmation lives on the success page.
Live payments are not enabled: a live key is refused unless
`STRIPE_ALLOW_LIVE_MODE=true`.

## Configuration

`src/config/site.ts` is the single source of truth for the store name, tagline,
description, currency, navigation, announcement strip, newsletter copy and
social links — no duplicated literals in components.

Environment variables are documented in `.env.example`. `DATABASE_URL`,
`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only and must never
be committed or exposed to the client bundle; only `NEXT_PUBLIC_*` values ever
reach the browser.

## Conventions

- TypeScript strict mode, plus `noUncheckedIndexedAccess`, `noUnusedLocals` and
  `noUnusedParameters`. No `any`.
- Server Components by default; `"use client"` only where interaction requires
  it (`NavLink`, `MobileMenu`, error boundaries).
- Semantic, accessible markup: landmarks, labelled navigation, skip link,
  visible focus rings, `aria-current`, `inert` on the closed drawer.
- Responsive from 320px up; no horizontal overflow at any width.
