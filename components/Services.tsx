"use client";

import { useState } from "react";
import Image from "next/image";
import { Service, ServiceCategory } from "@/lib/types";

type ServicesProps = {
  services: Service[];
  categories: ServiceCategory[];
  images: string[];
  moreHref: string;
};

export default function Services({ services, categories, images, moreHref }: ServicesProps) {
  const [active, setActive] = useState<number | null>(null);
  const activeService = active !== null ? services[active] : null;
  const relatedOptions = activeService
    ? categories.find((c) => c.slug === activeService.categorySlug)?.options.filter(
        (o) => o !== activeService.name,
      ) ?? []
    : [];

  return (
    <section className="px-6 pb-16">
      <h2 className="text-center font-display text-2xl md:text-3xl tracking-widest2 uppercase">
        Services
      </h2>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
        {services.map((service, i) => (
          <button
            key={service.name}
            type="button"
            onClick={() => setActive(i)}
            className="border border-hairline text-center transition-colors hover:bg-ink/5"
          >
            {images[i] && (
              <div className="h-28 w-full overflow-hidden">
                <Image
                  src={images[i]}
                  alt={service.name}
                  width={200}
                  height={160}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="px-4 py-6">
              <p className="font-display text-sm">{service.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">{service.description}</p>
            </div>
          </button>
        ))}
      </div>

      <a
        href={moreHref}
        className="mx-auto mt-8 flex max-w-3xl items-center justify-center border border-hairline py-3 text-xs tracking-[0.3em] uppercase text-ink/80 transition-colors hover:bg-ink hover:text-cream"
      >
        See More
      </a>

      {activeService && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-6 py-10 sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-full w-full max-w-md overflow-y-auto bg-cream px-6 py-8 text-center"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-3 text-2xl text-ink/60 hover:text-bronze"
            >
              &times;
            </button>

            <p className="font-display text-xl">{activeService.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{activeService.description}</p>

            <div className="mx-auto mt-6 flex max-w-xs justify-center gap-8 border-y border-hairline py-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50">Duration</p>
                <p className="mt-1 font-display">{activeService.duration}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/50">From</p>
                <p className="mt-1 font-display">{activeService.priceFrom}</p>
              </div>
            </div>

            <p className="mt-4 text-left text-xs uppercase tracking-widest text-ink/50">
              Care Taken
            </p>
            <p className="mt-2 text-left text-sm leading-relaxed text-ink/70">{activeService.care}</p>

            {relatedOptions.length > 0 && (
              <>
                <p className="mt-6 text-left text-xs uppercase tracking-widest text-ink/50">
                  You Might Also Like
                </p>
                <ul className="mt-2 flex flex-wrap gap-2 text-left">
                  {relatedOptions.map((option) => (
                    <li
                      key={option}
                      className="border border-hairline px-3 py-1.5 text-xs text-ink/70"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <a
              href={moreHref}
              onClick={() => setActive(null)}
              className="mt-8 flex items-center justify-center bg-ink py-3 text-xs tracking-[0.3em] uppercase text-cream transition-colors hover:bg-bronze"
            >
              Book This Service
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
