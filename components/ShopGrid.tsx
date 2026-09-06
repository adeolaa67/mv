"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ButterflyBurst from "./ButterflyBurst";
import { PRODUCT_CATEGORIES, ProductCategorySlug, WigProduct, minPricePence } from "@/lib/wigProducts";

type ShopGridProps = {
  products: WigProduct[];
  initialCategory?: ProductCategorySlug;
};

type Burst = { x: number; y: number } | null;

export default function ShopGrid({ products, initialCategory }: ShopGridProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ProductCategorySlug>(initialCategory ?? "wigs");
  const [burst, setBurst] = useState<Burst>(null);

  function openProduct(id: string, e: React.MouseEvent) {
    e.preventDefault();
    setBurst({ x: e.clientX, y: e.clientY });
    window.setTimeout(() => router.push(`/shop/${id}`), 220);
  }

  const visibleProducts = products.filter((p) => p.category === activeCategory && p.imageUrl);

  return (
    <section className="px-6 pb-20">
      <div className="mx-auto mb-10 flex max-w-4xl flex-wrap justify-center gap-2 sm:gap-3">
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActiveCategory(c.slug)}
            className={`pop-click border px-5 py-2.5 text-xs uppercase tracking-widest transition-colors ${
              activeCategory === c.slug
                ? "border-bronze bg-bronze text-cream"
                : "border-hairline text-ink/60 hover:border-bronze hover:text-bronze"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <p className="mx-auto max-w-md text-center text-sm text-ink/50">
          New {PRODUCT_CATEGORIES.find((c) => c.slug === activeCategory)?.label.toLowerCase()} are on their way —
          check back soon.
        </p>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => {
            const from = minPricePence(product);
            return (
              <a
                key={product.id}
                href={`/shop/${product.id}`}
                onClick={(e) => openProduct(product.id, e)}
                className="pop-click group block border border-hairline text-center transition-colors hover:border-bronze hover:bg-ink/5"
              >
                <div className="h-56 w-full overflow-hidden sm:h-64 lg:h-72">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-4 py-5">
                  <p className="font-display text-base">{product.name}</p>
                  <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-ink/60">
                    {product.description}
                  </p>
                  {from != null && (
                    <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                      From £{(from / 100).toFixed(2)}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-xs uppercase tracking-widest text-bronze">
                    Select options →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {burst && <ButterflyBurst originX={burst.x} originY={burst.y} onDone={() => setBurst(null)} />}
    </section>
  );
}
