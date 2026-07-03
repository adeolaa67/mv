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
  HoursContact.tsx     Two-column hours + contact block
  PolicyCard.tsx       Single policy tile (icon + script title + copy)
  BookingPolicies.tsx  Grid of PolicyCards
  HairPurchaseGuide.tsx Three-column "how to order extensions" guide
  CtaBanner.tsx        Dark full-width call-to-action bar
  CategorySelector.tsx Client component: service list with Select buttons
  icons.tsx            Small inline icon set (no external icon package)
lib/
  types.ts            Shared content types
  content.ts           All page copy in one editable place
```

## Editing content

Everything text-based — hours, contact details, policies, the extensions
buying guide, and the service categories — lives in `lib/content.ts`. Update
that file and every component re-renders with the new data; no component
code needs to change.

## Wiring up "Select"

`CategorySelector` is a client component. Its `handleSelect` function
currently does `router.push('/book/${category.slug}')`. Point it at your
real booking flow (a modal, a form step, or a dedicated `/book/[slug]` route).

## Notes

- The stylist photo is a placeholder initial avatar (`StylistIntro.tsx`) —
  drop in a real `next/image` once you have image assets.
- Colors and type are defined as CSS variables in `globals.css` and mapped
  in `tailwind.config.ts`, so retheming is a one-file change.
