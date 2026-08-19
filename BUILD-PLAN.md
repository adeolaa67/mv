# ByAdeBless Hair — Booking System Build Plan

This is the spec to hand to a Claude Project (along with this repo) to build out
the booking system in order. It captures what already exists, what's missing,
and the concrete steps/files for each phase.

## 1. Current state

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind, Firebase JS SDK
  (`firebase` v12) already installed. No auth, Stripe, or email library yet.
- **Frontend is built and content-driven.** All copy lives in `lib/content.ts`;
  components in `components/` render it. Nothing below needs frontend redesign,
  only new functionality wired into what exists.
- **`components/BookingCalendar.tsx`** is a fully working UI mockup: month grid,
  date pick, hourly slots (9am–5pm, `SLOTS` const), category/sub-category
  selects, "Book" button. `handleBook()` just sets local state — **no data is
  submitted anywhere.** This is the component that needs to start calling a
  real API.
- **`lib/availability.ts`** already reads a Firestore `blockedDates` collection
  (doc ID = `yyyy-mm-dd`, existence = blocked) and feeds it into the calendar
  as `unavailableDates`. This part of the plan is already half-built — keep
  the collection shape unless there's a strong reason to change it.
- **`lib/firebase.ts`** has a real project (`adeola-s-hair`) wired up with a
  hardcoded client config. Firestore security rules currently reject reads
  (see README: "Missing or insufficient permissions") — nothing works
  end-to-end yet because of this, not because of missing client code.
- **Gap in the current design**: `blockedDates` only blocks entire days. It
  has no concept of an individual slot being taken. Once real bookings exist,
  slot-level availability (is 2pm on the 14th already booked?) needs to come
  from the `bookings` collection too, not just `blockedDates`. Phase 3 below
  covers this.

## 2. Target architecture

- **Client writes stay read-only.** The browser never writes directly to
  Firestore for anything that matters (blocked dates, bookings). All writes
  go through Next.js API routes running the **Firebase Admin SDK** with a
  service account, gated by either the admin session (dashboard actions) or a
  verified Stripe webhook signature (bookings). This is what makes "only push
  to Firebase on success" actually enforceable.
- **Admin auth is a single fixed login**, not multi-user. A password (and
  optionally a username) lives in an env var; a Next.js API route checks it
  and sets a signed, httpOnly session cookie. `middleware.ts` protects
  `/admin/*` routes by checking that cookie. No Firebase Auth user accounts
  needed for this.
- **Payments use Stripe Checkout** (hosted page, not a custom card form —
  far less PCI surface). A `/api/checkout` route creates a Checkout Session
  server-side; the browser redirects to Stripe; Stripe redirects back to a
  success/cancel page. The booking is only ever written to Firestore from the
  **webhook handler** after Stripe confirms payment — never from the
  success-page redirect, which a user can hit or fake without paying.
- **Email confirmation** fires from the same webhook handler, after the
  Firestore write succeeds, using a transactional email provider (Resend is
  simplest to wire into a Next.js API route; SMTP via Nodemailer works too).

## 3. Data model (Firestore)

```
blockedDates/{yyyy-mm-dd}          # existing — whole day off
  createdBy: string                # admin identifier, for audit
  createdAt: Timestamp

bookings/{autoId}
  date: string                     # yyyy-mm-dd
  slot: string                     # e.g. "2:00pm" — matches BookingCalendar SLOTS
  categorySlug: string
  subOption: string
  customerName: string
  customerEmail: string
  customerPhone: string
  priceFrom: string                 # snapshot of price at booking time
  status: "confirmed" | "cancelled"
  stripeSessionId: string
  stripePaymentIntentId: string
  createdAt: Timestamp
  cancelledAt: Timestamp | null
```

Slot availability for a given date = `SLOTS` minus any slot already present in
a `confirmed` `bookings` doc for that date, minus everything if the date is in
`blockedDates`. Update `lib/availability.ts` (or add a sibling function) to
return per-date booked slots, not just fully-blocked dates.

### Firestore security rules (sketch)

```
match /blockedDates/{date} {
  allow read: if true;   // public calendar needs this
  allow write: if false; // admin writes go through Admin SDK only
}
match /bookings/{id} {
  allow read, write: if false; // server-only via Admin SDK
}
```

## 4. Environment variables

Move the hardcoded Firebase client config in `lib/firebase.ts` into env vars
(not because the client API key is secret — Firebase client keys are meant to
be public — but so the repo isn't hardcoded to one project and secrets aren't
mixed in with it). Everything else here is genuinely secret and must never
reach the client bundle (no `NEXT_PUBLIC_` prefix):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=        # service account, from Firebase console

ADMIN_USERNAME=
ADMIN_PASSWORD=
SESSION_SECRET=                    # random 32+ byte string, signs the admin cookie

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # only needed if you add Stripe.js on the client later

RESEND_API_KEY=                    # or SMTP_* vars if using Nodemailer
EMAIL_FROM=
```

Add `.env.local` to `.gitignore` if it isn't already, and commit a
`.env.example` with the keys (no values) so the Claude Project knows what to
ask for.

## 5. Build order

### Phase 1 — Admin login
- Add `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `SESSION_SECRET` env vars.
- `app/admin/login/page.tsx` — simple form, posts to an API route.
- `app/api/admin/login/route.ts` — checks credentials, sets a signed httpOnly
  cookie (e.g. with `jose` or `iron-session`).
- `middleware.ts` — redirects unauthenticated requests to `/admin/*` back to
  `/admin/login`.
- `app/api/admin/logout/route.ts` — clears the cookie.

**Done when**: visiting `/admin/dashboard` without logging in redirects to
`/admin/login`; correct credentials get you in; wrong credentials don't.

### Phase 2 — Admin dashboard + block-out calendar
- `app/admin/dashboard/page.tsx` — protected page, shows a month calendar
  (can reuse the visual pattern from `BookingCalendar.tsx` without the
  zoom/slot-picking parts) where clicking a date toggles it blocked/unblocked.
- `app/api/admin/blocked-dates/route.ts` — `GET` lists blocked dates, `POST`/
  `DELETE` toggle one, using the Firebase Admin SDK, gated by the admin
  session cookie.
- Wire the dashboard calendar to these routes.

**Done when**: an admin can block/unblock a date from the dashboard and it
persists in Firestore.

### Phase 3 — Fetch availability into the user-facing calendar
- Update `lib/availability.ts` (or add `getBookedSlots(dateRange)`) to also
  pull confirmed bookings, so `BookingCalendar` can grey out individual
  booked slots, not just fully-blocked days.
- Confirm Firestore rules (Section 3) actually allow the public read that
  `lib/availability.ts` needs — this is the permissions error already called
  out in the README.

**Done when**: a date that's fully blocked shows as unavailable on the public
calendar, and a date with some slots already booked shows those specific
slots as taken.

### Phase 4 — Stripe account + API wiring
- Create/connect a Stripe account (test mode first), add `STRIPE_SECRET_KEY`
  and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Install `stripe` (server SDK).
- `app/api/checkout/route.ts` — takes `{ date, slot, categorySlug, subOption,
  customerName, customerEmail, customerPhone }` from `BookingCalendar`'s
  "Book" button, looks up the price from `lib/services.ts`/`content.ts`,
  creates a Stripe Checkout Session with that data in `metadata`, returns the
  session URL.
- Update `BookingCalendar.tsx`'s `handleBook` to collect contact details,
  `POST` to `/api/checkout`, then redirect the browser to the returned URL
  instead of just setting `booked = true`.
- `app/booking/success/page.tsx` and `app/booking/cancelled/page.tsx` as the
  Checkout Session's `success_url`/`cancel_url` — these are purely UI, they
  do not write to Firestore.

**Done when**: clicking "Book" sends you to a real (test-mode) Stripe
Checkout page pre-filled with the right amount.

### Phase 5 — Webhook: confirm payment → write booking → block the slot
- `app/api/stripe/webhook/route.ts` — verifies the Stripe signature with
  `STRIPE_WEBHOOK_SECRET`, handles `checkout.session.completed`, reads the
  metadata set in Phase 4, and **only then** writes a `bookings` doc via the
  Admin SDK.
- Register the webhook in the Stripe dashboard (or `stripe listen --forward-to
  localhost:3000/api/stripe/webhook` for local dev).

**Done when**: completing a real test-mode payment produces a `bookings` doc
in Firestore, and the slot shows as taken on the public calendar afterward
(Phase 3's read picks it up automatically).

### Phase 6 — Email confirmation
- Add an email provider (Resend recommended — simplest API for a single
  transactional email; add `RESEND_API_KEY` and `EMAIL_FROM`).
- In the webhook handler, after the Firestore write succeeds, send a
  confirmation email to `customerEmail` with the date/slot/service/amount.
- Consider also emailing the admin address for each new booking.

**Done when**: a completed test booking produces both a Firestore doc and a
confirmation email.

### Phase 7 — Bookings list on the admin dashboard
- `app/api/admin/bookings/route.ts` — `GET` lists bookings (filter by
  upcoming/past), gated by the admin session.
- Add a bookings table/list to `app/admin/dashboard/page.tsx`.

**Done when**: the admin can see all confirmed bookings with customer/service/
date/time details.

### Phase 8 — Cancellation and receipts (stretch)
- Admin action to cancel a booking: sets `status: "cancelled"`,
  `cancelledAt`, frees the slot back up (Phase 3's read already excludes
  non-`confirmed` bookings if you filter on status).
- Optional: trigger a Stripe refund via the Admin SDK-backed API route when
  cancelling.
- Receipts: Stripe can auto-send its own receipt on successful payment
  (toggle in Stripe dashboard settings) — usually sufficient without building
  a custom receipt flow.

## 6. Open decisions for whoever runs this build

- **Session mechanism for admin auth** — `iron-session` vs a hand-rolled
  signed JWT cookie via `jose`. Either is fine for a single fixed login;
  pick whichever the Claude Project prefers, just keep it server-verified in
  `middleware.ts`, not a client-side flag.
- **Email provider** — Resend vs SMTP/Nodemailer. Resend is less setup if a
  Resend account gets created; Nodemailer works with any existing mailbox
  (e.g. Gmail app password) with zero new accounts.
- **Stripe Checkout vs Payment Element** — this plan assumes hosted Checkout
  (redirect) since it's the fastest to ship securely. A custom embedded card
  form (Payment Element) is more polished but meaningfully more work and not
  necessary for v1.
