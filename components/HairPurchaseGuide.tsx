import Link from "next/link";
import { PurchaseStep } from "@/lib/types";

type HairPurchaseGuideProps = {
  steps: PurchaseStep[];
};

export default function HairPurchaseGuide({ steps }: HairPurchaseGuideProps) {
  return (
    <section className="px-6 pb-14">
      <hr className="mx-auto mb-14 max-w-xs border-hairline" />

      <h2 className="text-center font-display text-xl md:text-2xl tracking-wide uppercase leading-snug">
        Purchasing Our Virgin Human
        <br />
        Hair Extensions
      </h2>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
        {steps.map((step) =>
          step.title === "How to order" ? (
            <Link
              key={step.title}
              href="/shop"
              className="card-alive block border border-hairline px-6 py-7 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-bronze">
                {step.title}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink/75">{step.body}</p>
              <span className="mt-3 inline-block text-xs uppercase tracking-widest text-bronze">
                Shop wigs ›
              </span>
              <span aria-hidden className="card-alive-bar" />
            </Link>
          ) : (
            <div key={step.title} className="card-alive border border-hairline px-6 py-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-bronze">
                {step.title}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink/75">{step.body}</p>
              <span aria-hidden className="card-alive-bar" />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
