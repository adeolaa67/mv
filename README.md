# MV Hair UK — Booking Page

A Next.js (App Router) + TypeScript + Tailwind rebuild of the booking landing
page, broken into small, reusable modules driven by one content file.

## Run it

```bash
npm install
npm run dev
```

## Structure

```
app/
  layout.tsx        Fonts (Playfair Display / Cormorant Garamond / Alex Brush) + global shell
  page.tsx           Assembles all sections in order
  globals.css        Design tokens (cream / ink / hairline / bronze)
components/
  SiteHeader.tsx       Wordmark, tagline, location pin
  StylistIntro.tsx     "Meet [Name]" bio card + avatar
  Gallery.tsx          Infinite-scroll photo carousel + review + lightbox modal
  HoursContact.tsx     Two-column hours + contact block
  PolicyCard.tsx       Single policy tile (icon + script title + copy)
  BookingPolicies.tsx  Grid of PolicyCards
  Services.tsx         Grid of services with a "See More" link to the calendar
  HairPurchaseGuide.tsx Three-column "how to order extensions" guide
  CtaBanner.tsx        Dark full-width call-to-action bar
  BookingCalendar.tsx  Month-grid date picker + slot-booking form (client component)
  icons.tsx            Small inline icon set (no external icon package)
lib/
  types.ts            Shared content types
  content.ts           All page copy in one editable place
  images.ts             Shared "read filenames from a public/ folder" helper
  gallery.ts            Gallery photos from public/gallery
  services.ts           Service photos from public/services
  firebase.ts            Firebase app + Firestore init (no Analytics — server-safe)
  availability.ts        Reads blocked dates from Firestore
```

## Editing content

Everything text-based — hours, contact details, policies, the extensions
buying guide, gallery reviews, and services — lives in `lib/content.ts`.
Update that file and every component re-renders with the new data; no
component code needs to change. Photos go in `public/gallery/` and
`public/services/` (services are matched to `lib/content.ts` services by
position — nth image goes with the nth service).

## Wiring up the booking calendar

`BookingCalendar` renders a month grid. Clicking a date that's blocked (or in
the past) plays a shake animation and nothing else. Clicking an open date
"zooms the camera" into that date — the grid scales up and fades out from the
clicked cell's position while a large day number and a slot-booking form
(hourly, 9am–5pm) scale in from the same point. Pressing "Back" reverses it:
the form/number fade out and the grid zooms back in to full view. Slot
selection is local UI state only — no booking is submitted yet.

`unavailableDates` comes from `lib/availability.ts`, which reads every
document ID out of a Firestore `blockedDates` collection (document existence
= that date is blocked). This assumes the planned admin view will manage
blocked dates that way — adjust the collection/field shape in
`lib/availability.ts` if it ends up different. The read is wrapped in a
try/catch so a Firestore permissions or config issue degrades to "nothing
blocked" instead of taking the page down — right now your project's default
security rules reject the read (see server console: "Missing or insufficient
permissions"), so you'll want to open up read access on `blockedDates` (e.g.
`allow read: if true;` for a public collection, or scope it to your admin
auth) before this shows real data.

## Notes

- The stylist photo is a placeholder initial avatar (`StylistIntro.tsx`) —
  drop in a real `next/image` once you have image assets.
- Colors and type are defined as CSS variables in `globals.css` and mapped
  in `tailwind.config.ts`, so retheming is a one-file change.
