import Link from "next/link";

// Purely a UI landing page — reached if the customer backs out of Stripe
// Checkout. No slot was ever held for them (nothing is written to Firestore
// until a webhook confirms payment), so there's nothing to release here.
export default function BookingCancelledPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="font-display text-2xl md:text-3xl">Checkout cancelled</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
        No payment was taken and no slot was held. Head back to the calendar whenever you&apos;re
        ready to try again.
      </p>
      <Link
        href="/#calendar"
        className="mt-8 border border-hairline px-6 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream"
      >
        Back to calendar
      </Link>
    </main>
  );
}
