"use client";

import { useState } from "react";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Shipping Information",
    body: [
      "Orders are processed within 1–2 working days before they're dispatched.",
      "UK delivery takes approximately 5–7 working days from dispatch — you'll get a confirmation email with tracking as soon as your order ships.",
      "Once an order has left us, delivery is handled by the courier and is outside of our control, so please order in good time for any event or appointment.",
      "EU and worldwide orders can take 10–14 working days from dispatch. Any customs fees, duties, or import taxes are the customer's responsibility and aren't included in the order total.",
    ],
  },
  {
    title: "Wig Cap Size Guide",
    body: [
      "Use a soft tape measure and wrap it around your head at the hairline — across the forehead, above the ears, and around the nape of your neck.",
      "Petite / Small: approx. 20.5\"–21.5\"",
      "Average / Medium: approx. 21.5\"–22.5\" (the most common size)",
      "Large: approx. 22.5\"–23.5\"",
      "Most units come with adjustable straps and combs so they can be fitted comfortably within their size range.",
      "Not sure which size you need? Message us before ordering and we'll help you choose.",
    ],
  },
  {
    title: "Returns, Refunds & Cancellations",
    body: [
      "All hair is prepared to order, so we're unable to offer refunds once an order has been processed.",
      "For hygiene reasons, we can't accept returns on any hair that's been worn, used, styled, or handled.",
      "If something arrives damaged, faulty, or different from what you ordered, email us clear photos within 72 hours of delivery and we'll sort it out.",
      "We don't offer exchanges, so please double-check length, lace, texture, and quantity before checking out — message us first if you're unsure.",
      "Once an order has been placed and processing has begun it can't be cancelled or amended, so only place your order when you're ready.",
    ],
  },
];

export default function ShopPolicyInfo() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto mt-14 max-w-5xl divide-y divide-hairline border-y border-hairline">
      {SECTIONS.map((section, i) => {
        const open = openIndex === i;
        return (
          <div key={section.title}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="pop-click flex w-full items-center justify-between px-1 py-5 text-left text-xs uppercase tracking-widest text-ink/80 hover:text-bronze"
            >
              {section.title}
              <span className="text-lg leading-none">{open ? "−" : "+"}</span>
            </button>
            {open && (
              <div className="space-y-3 px-1 pb-6 text-sm leading-relaxed text-ink/70">
                {section.body.map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
