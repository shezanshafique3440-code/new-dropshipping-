# ZYVERO — Storefront Foundation

*Discover. Choose. Enjoy.*

A premium international storefront built with Next.js (App Router), TypeScript
and Tailwind CSS.

> **Status: Step 12 — database-backed product catalogue.**
> Foundation, design system, homepage, catalogue, cart, checkout, Stripe
> payments, durable order storage, customer sign-in, order history, an
> internal operations panel and product management are in place. **The
> catalogue is a PostgreSQL table**: the storefront reads published products
> from it, and operators create, edit, publish and archive them in the panel. Payment runs through Stripe Checkout
> and is expected to be in **test mode**: a live key is refused unless the
> deployment explicitly opts in (see [Payments](#payments-stripe)). **Guest
> checkout remains fully supported** — an account is never required to buy,
> and guest orders never appear in anybody's history, though an operator can
> see them. Password reset, email verification, two-factor authentication,
> product and catalogue management, refunds, fulfilment and tracking, tax,
> transactional email, supplier integrations, product imports, inventory and
> product photography are deliberately **not** implemented yet.

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
| `npm run db:seed`     | Load the starter catalogue (idempotent; `-- --force` rewrites) |
| `npm run admin:bootstrap` | Create the first administrator (see [Operations panel](#operations-panel-admin)) |

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
│   ├── login|register/page.tsx # Authentication
│   ├── account/page.tsx        # Signed-in account dashboard
│   ├── account/orders/         # Order history, detail, loading, not-found
│   ├── admin/                  # Operations panel (noindex, separate session)
│   │   ├── login/page.tsx      # Admin sign-in, outside the shell
│   │   └── (panel)/            # Everything behind requireAdmin()
│   │       ├── page.tsx        # Dashboard
│   │       ├── orders/         # List, filters, search, pagination
│   │       ├── orders/[reference]/  # One order, with status control
│   │       ├── products/       # Catalogue list, create, edit, publish
│   │       └── account/page.tsx     # The operator's own profile
│   ├── checkout/page.tsx       # Checkout flow
│   ├── checkout/success/       # Stripe return: verifies before confirming
│   └── api/
│       ├── auth/register|login|logout/route.ts
│       ├── admin/login|logout/route.ts
│       ├── admin/orders/[reference]/status/route.ts
│       ├── admin/products/route.ts               # create
│       ├── admin/products/[slug]/route.ts        # edit
│       ├── admin/products/[slug]/status/route.ts # publish|archive
│       ├── account/profile/route.ts
│       ├── checkout/create-session/route.ts
│       ├── checkout/session-status/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── brand/                  # Brand identity
│   │   ├── Wordmark.tsx        # Text-based ZYVERO wordmark + monogram
│   │   └── BrandShowcase.tsx   # Decorative hero composition
│   ├── admin/                  # Operations panel UI
│   │   ├── AdminShell.tsx      # client — sidebar, mobile drawer
│   │   ├── AdminNav.tsx        # client — sections, aria-current
│   │   ├── AdminLoginForm.tsx  # client — sign-in
│   │   ├── AdminDashboard.tsx  # KPI cards from real aggregates
│   │   ├── AdminOrderList.tsx  # table on desk, cards on a phone
│   │   ├── AdminOrderFilters.tsx    # client — search and filters, in the URL
│   │   ├── AdminOrderDetail.tsx     # one order, operator's view
│   │   ├── OrderStatusControl.tsx   # client — cancel, with confirmation
│   │   ├── AdminProductList.tsx     # catalogue table and cards
│   │   ├── AdminProductFilters.tsx  # client — search and filters, in the URL
│   │   ├── AdminProductForm.tsx     # client — create and edit
│   │   └── ProductStatusControl.tsx # client — publish, unpublish, archive
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
├── lib/                        # env, format, money, cart, checkout, catalog, categories, routes
├── server/                     # server-only: never imported by a client component
│   ├── admin/                  # administrators: sessions, authorization, bootstrap
│   │   └── orders/             # admin order repository, DTO, query parsing, service
│   ├── catalog/                # products: repository, services, DTOs, validation
│   ├── auth/                   # passwords, sessions, customers, authorization
│   ├── db/                     # Prisma client singleton + connection config
│   ├── http/                   # same-origin (CSRF) checks
│   ├── orders/                 # order domain: repository, adapters, transitions, service
│   ├── payments/               # Stripe client, config, validation, session, orders
│   └── rate-limit.ts
├── styles/globals.css          # Tokens, theme mapping, utilities
├── proxy.ts                    # Edge gate for /account and /admin (was middleware.ts)
└── types/index.ts
prisma/
├── schema.prisma               # Order, OrderItem, Product, Customer, AdminUser, sessions, history
└── migrations/                 # Committed, applied in order
prisma.config.ts                # Where the Prisma CLI reads DATABASE_URL
scripts/
├── bootstrap-admin.mjs         # `npm run admin:bootstrap`
├── seed-products.mjs           # `npm run db:seed`
└── ts-resolve*.mjs             # Lets node run the app's TypeScript directly
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
| `Customer`              | A registered shopper: normalized email, name, Argon2id hash        |
| `CustomerSession`       | A signed-in session: token digest, deadlines, revocation           |
| `OrderItem`             | An immutable snapshot of one purchased line                       |
| `Product`               | A catalogue product: slug, copy, category, integer price, status, merchandising flags, artwork key |
| `AdminUser`             | A member of the operations team: normalized email, name, role, Argon2id hash, active flag |
| `AdminSession`          | An administrator's session: token digest, deadlines, revocation    |
| `OrderStatusHistory`    | Append-only trail of manual status changes: from, to, which administrator, when |
| `ProcessedWebhookEvent` | Stripe event ids already handled, so a retry cannot be processed twice |

Administrators are a separate table from customers on purpose, with their own
session table and their own cookie: there is no row that could turn a shopper
into an operator. See [Operations panel](#operations-panel-admin).

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

## Accounts and authentication

Customers can register, sign in, see their account, change their name and sign
out. Sessions live in PostgreSQL and are addressed by an HttpOnly cookie.

### Architecture

No authentication library is used. The requirement — email and password, with
sessions that can be revoked server-side — is served by roughly 400 lines of
explicit code, where every rule is visible and auditable, rather than by a
framework whose credentials flow would default to a JWT this project has no
use for.

```
browser cookie (256-bit random token)
  → customer_sessions row (SHA-256 of the token)
    → customers row
```

That resolution runs in `getCurrentCustomer()` and nowhere else. A customer id
in a request body, a query string or a hidden field is never accepted as
identity — the profile endpoint, for instance, has no way to address an
account other than the one the cookie resolves to.

| Route                        | What it does                                    |
| ---------------------------- | ----------------------------------------------- |
| `/register`                  | Create an account, signed in immediately         |
| `/login`                     | Sign in; supports `?next=` (validated)           |
| `/account`                   | Profile, security details, sign out              |
| `POST /api/auth/register`    | Validate, hash, insert, open a session           |
| `POST /api/auth/login`       | Verify and open a session                        |
| `POST /api/auth/logout`      | Revoke the session, clear the cookie             |
| `PATCH /api/account/profile` | Update first and last name                       |

### Customer model

`Customer` holds the email as typed (for display) and `emailNormalized` —
trimmed and lowercased — which is the unique identity, so `Amelia@Example.com`
and `amelia@example.com` can never become two accounts. It also holds the
password hash, first and last name, `emailVerifiedAt` and `lastLoginAt`
(the first is reserved for a verification step that does not exist yet), and
timestamps.

### Password hashing

**Argon2id**, via `@node-rs/argon2` (prebuilt binaries, so no compiler is
needed on the host), at the OWASP minimum of 19 MiB memory, 2 iterations and
1 lane. It was preferred over bcrypt because it is memory-hard: an attacker
with GPUs gains much less against it. Hashes are salted per password by the
library, and the plaintext exists only for the length of the request that
carries it — never logged, echoed, stored or returned.

A sign-in attempt for an address that does not exist still computes a
throwaway hash, so the timing does not reveal which addresses are registered.

### Session model

| Property   | Value                                                             |
| ---------- | ----------------------------------------------------------------- |
| Token      | 32 random bytes from `crypto.randomBytes`, base64url               |
| Stored as  | SHA-256 digest — the raw token exists only in the browser cookie   |
| Absolute   | 30 days from creation                                              |
| Idle       | 7 days since last use (`lastUsedAt`, written at most hourly)       |
| Revocation | `revokedAt` timestamp; sign-out sets it, resolution rejects it     |

A plain SHA-256 is right for the digest: the input is already 256 bits of
randomness, so there is nothing to brute-force and no need for a slow KDF.
Revoking is a column update rather than a delete, which leaves room for
"sign out everywhere", password-change invalidation and session auditing —
`revokeAllSessionsForCustomer()` is already there for the first of those.

### Cookie security

`zyvero_session`, `HttpOnly`, `SameSite=Lax`, `Path=/`, no `Domain`, and
`Secure` whenever `NODE_ENV=production` (so localhost still works over HTTP in
development). `Lax` rather than `Strict` because the cookie has to survive the
top-level return from Stripe's hosted checkout. The token is never in
`localStorage`, `sessionStorage`, a URL or React state.

### CSRF

Two layers, because `HttpOnly` does nothing for CSRF — it stops a script
reading the cookie, not a browser attaching it:

1. `SameSite=Lax` keeps the cookie off cross-site POSTs.
2. Every state-changing auth endpoint independently verifies `Origin` (falling
   back to `Referer`) against this deployment's origins, and refuses a request
   that carries neither. See `src/server/http/same-origin.ts`.

### Authorization

`/account` is protected on the server by `requireCustomer()`, which resolves
the session and redirects to `/login?next=…` when there is none. A middleware
matcher on `/account` turns "no cookie at all" into a clean HTTP redirect, but
it only checks that a cookie exists: it is an optimisation, and deleting it
would cost polish, not security.

`?next=` is validated by `safeNextPath()` — only a single-slash-rooted path on
this site survives; absolute URLs, `//host`, `javascript:`, backslashes,
control characters and over-long values all fall back to `/account`.

### Rate limiting

Registration 8/hour, sign-in 10 per 15 minutes, profile updates 20 per 15
minutes, sign-out 30/minute — per client, per endpoint. **This counter is in
each instance's memory**, exactly as it has been since Step 7: it is not
distributed, several instances each hold their own count, and a shared store
(Redis) has not been added. The seam is `checkRateLimit`, so replacing it
touches one file.

### Orders and accounts

`Order.customerId` is now a real foreign key to `Customer`, nullable and
`ON DELETE SET NULL`. When a signed-in customer starts checkout, the server
reads their id from the session cookie and puts it in the Stripe session's
metadata, so the webhook can link the resulting order to the account without
the browser ever asserting who it is. Guest orders keep a null `customerId`
for ever — ownership of an old guest order is never guessed from a matching
email address.

### Known trade-off: registration and email enumeration

Sign-in never says whether an address is registered. Registration does: it
answers "an account already exists for that email address", because the person
in front of the form needs to know, and they could confirm it anyway by trying
to sign in. The exposure is bounded by the rate limit (8 registrations per hour
per client) and by each attempt costing an Argon2id hash. Removing it entirely
would mean sending a "someone tried to register with your address" email, which
needs the transactional email that does not exist yet.

### Order history

| Route                          | What it shows                                     |
| ------------------------------ | -------------------------------------------------- |
| `/account`                     | Dashboard: the three most recent orders, profile, sign out |
| `/account/orders`              | The full history, newest first, paginated          |
| `/account/orders/[reference]`  | One order in full, addressed by `ZYV-XXXXXX`       |

**Authorization.** The customer id comes from the session cookie and goes into
the SQL, never the other way round: `listForCustomer(customerId, …)` and
`findForCustomer(customerId, reference)` carry ownership in the `WHERE`
clause, so an order belonging to somebody else is never read, let alone
filtered out afterwards. A reference that exists but belongs to another
account produces exactly the same not-found page as one that never existed,
and guest orders (`customerId IS NULL`) are invisible to every account —
a matching email address grants nothing, because email is not an
authorization mechanism.

**Pagination.** Keyset, on `(createdAt DESC, reference DESC)`. The reference
is unique, so the ordering is total and a page cannot repeat or skip a row
when two orders share a timestamp — which offset pagination would also get
wrong as soon as a new order arrives. The cursor is the edge row's
`(createdAt, reference)` pair, base64url-encoded to keep it opaque; it
contains no database id, and tampering with it changes which page is asked
for, never whose. Ten orders per page, and one extra row is read to decide
whether a "next" link is needed rather than running a second `COUNT`.

The composite index `orders(customerId, createdAt DESC, reference DESC)` is
exactly this query, added in the `order_history_index` migration and replacing
the plain `customerId` index it subsumes.

**What is shown.** Persisted values only. Line items are the historical
snapshot recorded at payment — a later catalogue rename or reprice cannot
change what an old order says was bought — while artwork and the "View
product" link come from today's catalogue and simply disappear if the product
is gone. Totals are the stored integers; nothing on these pages recalculates
money. The progress timeline covers only the states the model really has
(placed, payment, and closed/awaiting dispatch): there is no fulfilment
integration, so no order is ever described as shipped or delivered, and no
tracking number is invented.

**Tests.**

```bash
# order history against a real database and a running server
DATABASE_URL=... node --import ./register.mjs --test orders-db.test.mjs
node orders-browser.mjs      # journey, ownership and pagination in a browser
node orders-a11y.mjs         # accessibility plus 320-1920px in both themes
```

### Not implemented in this step

Password reset, email verification, "sign out everywhere" UI, two-factor
authentication, social sign-in, and cancelling or refunding an order from the
account. The pages say so rather than showing empty widgets. (Administrators
arrived in the next step and can cancel an order; a customer still cannot, and
refunds happen in Stripe.)

## Product catalogue

The products the shop sells live in PostgreSQL. The storefront reads published
rows from that table; operators create, edit, publish and archive them in the
operations panel. `src/data/mock-storefront.ts` is no longer a live catalogue
— it is the **seed data** a fresh database starts with.

### Loading the starter catalogue

```bash
npm run db:seed            # create anything missing, touch nothing else
npm run db:seed -- --force # also rewrite existing rows to the seed values
```

Deterministic and idempotent: every row is keyed by the product's id, so a
second run creates nothing. The default run never overwrites an existing row —
once the shop is live the catalogue belongs to whoever edits it in the panel,
and a re-seed should not quietly undo their work. `--force` is the explicit way
to say otherwise. No secrets, no customer data, nothing random.

### Statuses

| Status      | In the shop | Buyable | Notes                                    |
| ----------- | ----------- | ------- | ---------------------------------------- |
| `draft`     | no          | no      | Where a new product starts               |
| `published` | yes         | yes     | Visible, searchable, purchasable         |
| `archived`  | no          | no      | Withdrawn; existing orders are unaffected |

Only `published` products appear anywhere public — the homepage, the shop, the
search, related products, the product page, and the checkout's price lookup.
The scoping lives in the repository's `where` clause, so a draft is never read
in the first place rather than read and filtered out.

A draft's product page answers with Next's not-found UI and a
`<meta name="robots" content="noindex">`, carrying no product data. The status
code is a soft 404 rather than a real one: the response has already begun
streaming by the time the lookup finishes, which is the framework's documented
behaviour and the reason it injects the `noindex` itself.

**There is no delete.** Archiving is how a product leaves the shop. An order
may name it, and the catalogue is where that name's artwork and link come
from — so the panel offers archive, and nothing offers deletion.

### Slugs are immutable

A slug can be chosen when a product is created and never changed afterwards.
It is the product's public URL *and* the id recorded against every order that
has ever included it, so a rename would break a link and disconnect a receipt
at the same time. The edit form shows the slug read-only, and the update
endpoint reads the slug from the route — a slug in the request body is ignored
rather than obeyed.

The alternative, slug history with redirects, is a table and a lookup this step
does not need. Immutability is the simpler production-safe option, and it is
enforced rather than merely encouraged.

### Money

Prices are integers in minor units (cents), like every other amount in this
project. The admin form takes "19.99" and `parsePriceInput` turns it into
`1999` by splitting the string at the decimal point — never by multiplying a
float, because `Number("19.99") * 100` is `1998.9999999999998`.

Anything else is refused with a reason rather than rounded into something
plausible: three decimal places, a thousands separator, a currency symbol, a
negative, `NaN`, `Infinity`, an empty field. The database agrees separately —
`priceAmount >= 0`, `compareAtPriceAmount >= priceAmount` when present, and a
lowercase ISO 4217 currency — so a bad value cannot arrive by any other route.

### Order snapshots are untouchable

`order_items` has **no foreign key to `products`**, deliberately. An order
records the name and the unit amount that were charged at the time, and
nothing rewrites them afterwards. Editing a price, renaming a product,
unpublishing it, archiving it, or deleting the row outright leaves every
existing order saying exactly what it said before. There is a test for each of
those, including the specific case of a $49.99 product bought twice and then
repriced to $79.99: the old order stays at $49.99 × 2, and the next checkout
is charged $79.99.

### Stripe pricing authority

Unchanged in principle from Step 7, and now sourced from the table. When a
checkout session is created the server:

1. reads the basket's product ids and quantities — and nothing else — from the
   request;
2. looks those ids up in one query, **scoped to published products**;
3. takes `priceAmount` straight from the column, already an integer;
4. computes the totals server-side and builds Stripe's line items from them.

A price, a total or a discount in the request body is never read. A product
that is not published is simply absent from the lookup, so it cannot be
bought — the same answer as a product that never existed.

### Categories

One authoritative list, in `src/lib/product-categories.ts`, shared by the admin
form, the storefront filters, the repository and — through the
`products_category_known` CHECK constraint — the database. Adding a category is
an edit there plus a migration that widens the constraint; it is deliberately
not something a stray write can do. A Prisma enum would have created a second
list to keep in step, so the column is a `VARCHAR` with a constraint instead.

### Architecture

```
storefront page → catalog service → CatalogRepository → Prisma → PostgreSQL
admin page/API  → admin catalog service → CatalogRepository → Prisma → PostgreSQL
```

Only the repository talks to Prisma. The storefront service exposes published
reads; the admin service takes an `AdminActor` — the proof `requireAdmin()`
produces — as a required first argument, so a page that has not resolved an
administrator cannot read a draft, let alone write one, and the compiler says
so. Validation lives in the service, not the route, so the same rules apply
wherever a product comes from.

### Admin product routes

| Route                       | What it is                                    |
| --------------------------- | --------------------------------------------- |
| `/admin/products`           | Every product, with search, filters and paging |
| `/admin/products/new`       | Create a product (saved as a draft)            |
| `/admin/products/[slug]`    | Edit it, and publish, unpublish or archive it  |
| `POST /api/admin/products`  | Create                                         |
| `POST /api/admin/products/[slug]` | Edit                                     |
| `POST /api/admin/products/[slug]/status` | Publish, unpublish, archive     |

All of them are behind `requireAdmin()`, `noindex` and `no-store`, like the
rest of the panel.

Search matches a product's name or slug, filters cover status and category,
and paging is offset-based with a total — an operator thinks in pages and
wants to know how many products there are, and a keyset cursor gives neither.
All four happen in PostgreSQL; the browser never receives more products than
it displays.

### Concurrent edits

Saves are optimistic. The form carries the `updatedAt` it loaded, and the
update matches on it, so a save against a stale copy writes nothing and is
reported as a conflict rather than overwriting a colleague's work. Two
administrators saving at the same moment produce one write and one conflict.

### Artwork

Products are drawn with the built-in illustration set. The database stores a
key (`artKey`) and a tone, not an image — the visual identity is referenced,
never embedded — so nothing here depends on an image pipeline that does not
exist yet. Real photography arrives with the supplier integration.

### Tests

```bash
# prices, validation and query parsing, with no database
node --import ./register.mjs --test catalog-unit.test.mjs

# the repository, the services, and order snapshots after a price change
DATABASE_URL=... node --import ./register.mjs --test catalog-db.test.mjs

# the endpoints and the storefront over HTTP, against a production build
node --test catalog-http.test.mjs

# the whole admin journey in a browser
node catalog-browser.mjs

# accessibility, and 320-1920px in both themes
node catalog-a11y.mjs
```

### Not implemented in this step

Product variants, inventory, supplier feeds, CSV or automated imports, image
upload, product reviews, wishlists, coupons, bulk editing, and a delete
control. The panel says so where an operator might look for one.

## Operations panel (admin)

An internal panel for the people who run the shop: see the orders, find one,
and cancel it. It is a **separate authorization boundary** from the storefront
— different table, different session store, different cookie — so a customer
account can never become an administrator, however the storefront's own code
changes.

### Setting up the first administrator

There is no sign-up, and no password anywhere in this repository. An
administrator exists only because somebody ran the bootstrap script with
credentials they chose:

```bash
ADMIN_BOOTSTRAP_EMAIL=you@example.com \
ADMIN_BOOTSTRAP_PASSWORD='a long passphrase you chose' \
ADMIN_BOOTSTRAP_NAME='Your Name' \
npm run admin:bootstrap
```

The variables can live in `.env.local` instead (it is git-ignored). Both the
address and the password are required and neither has a default. The password
is hashed with the application's own Argon2id utility — the same one customer
passwords use — and is never printed, logged or stored in any other form.

Running it twice is safe: an address that already has an account is left
exactly as it is (the password is **not** silently rotated), and an account
that had been deactivated is switched back on.

In production the script additionally refuses to run unless
`ADMIN_BOOTSTRAP_ALLOW_PRODUCTION=true` is set, the same safety catch the
Stripe live-key check uses. Nothing creates an administrator merely because
the application started.

### Routes

| Route                         | What it is                                      |
| ----------------------------- | ----------------------------------------------- |
| `/admin/login`                | Sign-in. The only admin route without a session  |
| `/admin`                      | Dashboard: order figures and the latest orders   |
| `/admin/orders`               | Every order, with search, filters and paging     |
| `/admin/orders/[reference]`   | One order, with the status control and its trail |
| `/admin/account`              | The operator's own name, address and role        |
| `POST /api/admin/login`       | Creates an admin session                         |
| `POST /api/admin/logout`      | Revokes it server-side and clears the cookie     |
| `POST /api/admin/orders/[reference]/status` | The one state-changing endpoint    |

Every admin page and response is `noindex, nofollow` and `no-store`.

### Authentication and sessions

Administrators live in `admin_users`, their sessions in `admin_sessions`, and
the browser holds a 256-bit random token in a cookie named
**`zyvero_admin_session`** — deliberately not the storefront's
`zyvero_session`. The database stores only the token's SHA-256 digest, so a
database dump cannot be replayed as a login.

|                     | Customer session   | Admin session      |
| ------------------- | ------------------ | ------------------ |
| Cookie              | `zyvero_session`   | `zyvero_admin_session` |
| Absolute lifetime   | 30 days            | 8 hours            |
| Idle lifetime       | 7 days             | 30 minutes         |
| `SameSite`          | `Lax`              | `Strict`           |
| `HttpOnly`          | yes                | yes                |
| `Secure`            | in production      | in production      |

The admin cookie is `Strict` because nothing legitimately navigates into the
panel from another site; the storefront's is `Lax` only because the browser
has to come back from Stripe's hosted checkout. Both are `HttpOnly`, so no
script can read them, and revocation is a column update rather than a delete
— signing out kills the session server-side, not just in the browser.

### Authorization

`requireAdmin()` resolves admin cookie → admin session row → **active**
administrator, and is the only thing that grants access. It runs **in every
panel page**, not only in the shared layout: Next.js renders a layout and its
page in parallel, so a layout that redirects does not stop the page from
running or from putting its data in the RSC payload. (Next's own
authentication guide says as much; this project found out by testing it.)

Below that, the admin data functions take the resolved administrator as a
required argument — `listAdminOrders(admin, …)`, `changeOrderStatus(admin, …)`
— so a page that has not proved who is asking cannot compile, let alone read
an order. Nothing is ever taken from a request body, a query string, a header
or a hidden field: not a customer id, not an admin id, not a role.

`src/proxy.ts` (Next 16's renamed `middleware.ts`) redirects to the right
sign-in page when the relevant cookie is missing. It is an optimisation, not
the authorization — a made-up cookie value sails straight through it, and is
then refused by the page.

### Dashboard figures

Six numbers, each a count or a sum PostgreSQL produced from the orders table,
in two grouped aggregate queries. No conversion rate, no average-order-value
trend, no visitor count: the application does not measure those, and a
plausible figure nobody can trace is worse than no figure.

"Payments received" is deliberately narrow — the total of orders whose payment
**settled and has not been refunded**, summed **per currency**, because adding
a euro to a dollar would be a made-up number. Unpaid, failed, cancelled and
refunded orders are all excluded from it.

### Search, filters and pagination

All three are server-side and all three live in the URL, so a filtered view is
a link somebody can send to a colleague:

- **Search** matches a full order reference (case-insensitively — `zyv-a1b2c3`
  finds the order) or part of a customer's email address. Both reach Prisma as
  parameters; no user input is ever concatenated into SQL. The email search is
  a case-insensitive substring match, which PostgreSQL answers with a scan:
  honest at this size, and a `pg_trgm` index is the right addition when the
  table is large enough for that to show — not before, on a guess.
- **Filters** are checked against the real enums. Anything unrecognised
  degrades to "no filter" rather than erroring, and the "Clear" control
  removes them all.
- **Pagination** is keyset, on `(createdAt DESC, reference DESC)`, twenty per
  page, using the same opaque cursor the order history uses. Changing a filter
  drops the cursor. One extra row is read to decide whether there is a next
  page, instead of a second `COUNT` over the filtered set.

The `orders(createdAt DESC, reference DESC)` index added in the
`admin_operations` migration serves exactly this ordering; it replaces the
plain `createdAt` index, whose every use it covers.

### Order status: what an operator may change

**Cancelling, and nothing else.** The options are derived from the same state
machine the Stripe webhook obeys (`src/server/orders/transitions.ts`) with the
payment status held fixed, so the panel cannot widen the rules — and
`assertTransition` re-checks before anything is written.

**Payment status is not editable from the panel.** There is no "mark as paid"
button, and a `paymentStatus` in the request body changes nothing: money is
Stripe's to report, and a manual override would let this table contradict the
payment provider. Cancelling an order is not a refund, and the confirmation
says so — refunds are issued in Stripe.

The change is a compare-and-set inside a transaction: it applies only while
the order is still in the state the server validated against, so two operators
cancelling the same order at the same moment produce one status change and one
audit row, and the second is told it lost rather than silently succeeding.

### Audit trail

Every manual status change writes a row to `order_status_history` —
`fromStatus`, `toStatus`, which administrator, when — in the same transaction
as the change, so the trail can never disagree with the order. Rows are
append-only, and the administrator is a nullable reference set to null if the
account is ever deleted: losing who did it would be bad, losing the fact that
it happened would be worse. The trail is shown on the order page, and it
covers manual changes only — payment events belong to Stripe's own record.

### What an operator can see, and what nobody can

The admin projection is wider than the customer's — the full delivery address
for every order, whether the shopper had an account, the Stripe **payment
intent** id for reconciliation — and it is still hand-written. It contains no
password hash, no session token or digest, no API or webhook secret, no
Checkout Session id, no database uuid for the order, the customer or the
administrator, and no card data (this application has never held any: payment
happens on Stripe's page).

Guest orders **are** visible to an operator. That is the point of the panel,
and it is not a change to the storefront rule: a guest order still belongs to
no account and still cannot appear in anybody's order history.

### Rate limiting

Admin sign-in allows 5 attempts per client per 15 minutes; the status endpoint
allows 20 per minute. Both go through the same in-process limiter the rest of
the application uses — it stops one client hammering an endpoint, it is **not**
distributed, and several instances each hold their own count. `checkRateLimit`
is the seam a shared store would replace.

### Production notes

- Serve the panel over HTTPS. The session cookie is `Secure` in production, so
  it will not be sent over plain HTTP anywhere but localhost.
- Create administrators with the bootstrap script, from a shell with the
  database credentials — never by editing rows by hand, and never by
  committing a password.
- Withdraw access by setting `isActive = false` and revoking the sessions;
  the row stays so the audit trail keeps pointing at a name.
- There is no password change, no password reset and no second factor in the
  panel yet. Until there is, an admin password can only be rotated by somebody
  with database access.
- The rate limiter is per instance. Behind several instances, put a shared
  limiter in front of `/api/admin/*` or replace `checkRateLimit`.

### Tests

```bash
# rules that need no database: transitions, query parsing, links, bootstrap
node --import ./register.mjs --test admin-unit.test.mjs

# accounts, sessions, order queries, status changes and the audit trail
DATABASE_URL=... node --import ./register.mjs --test admin-db.test.mjs

# endpoints and pages over HTTP against a production build
node --test admin-http.test.mjs

# the journey in a browser, plus what must not work
node admin-browser.mjs

# accessibility, and 320-1920px in both themes
node admin-a11y.mjs
```

### Not implemented in this step

Product and catalogue management, supplier or fulfilment integration, shipping
carriers, issuing refunds, coupons, customer impersonation, marketing,
analytics, inventory, seller accounts, an admin role-management UI, admin
password change or reset, email verification and two-factor authentication.
The panel says so where an operator might look for them, rather than showing a
control that does nothing.

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
