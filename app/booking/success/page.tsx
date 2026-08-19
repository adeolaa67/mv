import Link from "next/link";

// Purely a UI landing page — Stripe redirects here after payment, but the
// booking is only ever written to Firestore by the webhook handler once it
// verifies payment, never from this page (a user could hit this URL, or
// fake it, without actually paying).
export default function BookingSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="font-display text-2xl md:text-3xl">Payment received</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
        Thank you — your payment has gone through and your appointment is booked and paid in full.
        You&apos;ll get a confirmation email shortly with the details.
      </p>
      <Link
        href="/"
        className="mt-8 border border-hairline px-6 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream"
      >
        Back to site
      </Link>
    </main>
  );
}
