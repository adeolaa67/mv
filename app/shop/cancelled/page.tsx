import Link from "next/link";

export default function ShopCancelledPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="font-display text-2xl md:text-3xl">Checkout cancelled</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
        No payment was taken. Head back to the shop whenever you&apos;re ready to try again.
      </p>
      <Link
        href="/shop"
        className="mt-8 border border-hairline px-6 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream"
      >
        Back to shop
      </Link>
    </main>
  );
}
