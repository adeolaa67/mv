"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import ButterflyBurst from "./ButterflyBurst";
import { PRODUCT_CATEGORIES, ProductCategorySlug, WigProduct, minPricePence } from "@/lib/wigProducts";

type ShopGridProps = {
  products: WigProduct[];
  initialCategory?: ProductCategorySlug;
};

type Burst = { x: number; y: number } | null;
type FullscreenImage = { url: string; alt: string } | null;

function uniqueInOrder(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export default function ShopGrid({ products, initialCategory }: ShopGridProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategorySlug>(initialCategory ?? "wigs");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [burst, setBurst] = useState<Burst>(null);
  const [length, setLength] = useState("");
  const [lace, setLace] = useState("");
  const [textureId, setTextureId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<FullscreenImage>(null);

  const activeProduct = products.find((p) => p.id === activeId) ?? null;

  // Length and lace are each optional on a product — some only vary by one
  // of them, or by neither — so the picker for a dimension only shows up
  // when at least one variant actually has a value for it.
  const lengths = useMemo(
    () => (activeProduct ? uniqueInOrder(activeProduct.variants.map((v) => v.length)) : []),
    [activeProduct],
  );
  const laces = useMemo(() => {
    if (!activeProduct) return [];
    const relevant = lengths.length > 0 ? activeProduct.variants.filter((v) => v.length === length) : activeProduct.variants;
    return uniqueInOrder(relevant.map((v) => v.lace));
  }, [activeProduct, lengths, length]);
  const matchedVariant = activeProduct?.variants.find(
    (v) => (lengths.length === 0 || v.length === length) && (laces.length === 0 || v.lace === lace),
  );
  const textures = activeProduct?.textures ?? [];
  const selectedTexture = textures.find((t) => t.id === textureId) ?? null;
  const needsTexture = textures.length > 0;
  const canCheckout = Boolean(matchedVariant) && (!needsTexture || Boolean(selectedTexture));
  const unitPence = matchedVariant ? matchedVariant.pricePence + (selectedTexture?.extraPricePence ?? 0) : undefined;
  const totalPence = unitPence != null ? unitPence * quantity : undefined;

  function openProduct(id: string, e: React.MouseEvent) {
    setBurst({ x: e.clientX, y: e.clientY });
    setActiveId(id);
    setLength("");
    setLace("");
    setTextureId("");
    setQuantity(1);
    setError(null);
  }

  function closeProduct() {
    setActiveId(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
  }

  function openFullscreen(url: string, alt: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFullscreenImage({ url, alt });
  }

  async function handleCheckout() {
    if (!activeProduct || !matchedVariant) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: activeProduct.id,
          variantId: matchedVariant.id,
          textureId: selectedTexture?.id,
          quantity,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong — please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong — please try again.");
      setSubmitting(false);
    }
  }

  const visibleProducts = products.filter((p) => p.category === activeCategory && p.imageUrl);

  return (
    <section className="px-6 pb-20">
      <div className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-3">
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActiveCategory(c.slug)}
            className={`pop-click border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
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
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {visibleProducts.map((product) => {
            const from = minPricePence(product);
            return (
              <div key={product.id} className="border border-hairline text-center transition-colors hover:bg-ink/5">
                <button
                  type="button"
                  onClick={(e) => openFullscreen(product.imageUrl, product.name, e)}
                  aria-label={`View ${product.name} fullscreen`}
                  className="pop-click block h-52 w-full cursor-zoom-in overflow-hidden sm:h-64"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => openProduct(product.id, e)}
                  className="pop-click block w-full px-4 py-5 text-center"
                >
                  <p className="font-display text-sm">{product.name}</p>
                  <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-ink/60">
                    {product.description}
                  </p>
                  {from != null && (
                    <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                      From £{(from / 100).toFixed(2)}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-xs uppercase tracking-widest text-bronze">See more</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {burst && <ButterflyBurst originX={burst.x} originY={burst.y} onDone={() => setBurst(null)} />}

      {activeProduct && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeProduct}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-6 py-10 sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="shop-card-enter relative max-h-full w-full max-w-md overflow-y-auto bg-cream px-6 py-8"
          >
            <button
              type="button"
              onClick={closeProduct}
              aria-label="Close"
              className="pop-click absolute right-4 top-3 text-2xl text-ink/60 hover:text-bronze"
            >
              &times;
            </button>

            <button
              type="button"
              onClick={(e) => openFullscreen(activeProduct.imageUrl, activeProduct.name, e)}
              aria-label="View photo fullscreen"
              className="pop-click block h-72 w-full cursor-zoom-in overflow-hidden sm:h-80"
            >
              <Image
                src={activeProduct.imageUrl}
                alt={activeProduct.name}
                width={600}
                height={480}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </button>

            <p className="mt-4 text-center font-display text-xl">{activeProduct.name}</p>
            <p className="mt-2 whitespace-pre-line text-center text-sm leading-relaxed text-ink/70">
              {activeProduct.description}
            </p>

            <div className="mt-6 space-y-3 text-left">
              {lengths.length > 0 && (
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-ink/60">Length</span>
                  <select
                    value={length}
                    onChange={(e) => {
                      setLength(e.target.value);
                      setLace("");
                    }}
                    className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="">Choose a length…</option>
                    {lengths.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {laces.length > 0 && (lengths.length === 0 || length) && (
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-ink/60">Lace</span>
                  <select
                    value={lace}
                    onChange={(e) => setLace(e.target.value)}
                    className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="">Choose a lace type…</option>
                    {laces.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {matchedVariant && textures.length > 0 && (
                <div className="block">
                  <span className="text-xs uppercase tracking-widest text-ink/60">Texture</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {textures.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTextureId(t.id)}
                        className={`pop-click border px-3 py-2 text-xs transition-colors ${
                          textureId === t.id
                            ? "border-bronze bg-bronze text-cream"
                            : "border-hairline text-ink/70 hover:border-bronze hover:text-bronze"
                        }`}
                      >
                        {t.name}
                        <span className={`ml-1.5 ${textureId === t.id ? "text-cream/80" : "text-ink/50"}`}>
                          {t.extraPricePence > 0 ? `+£${(t.extraPricePence / 100).toFixed(2)}` : "Free"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedVariant && (
                <>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-ink/60">Quantity</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(50, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-ink/60">Name</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-ink/60">Email</span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-ink/60">Phone</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                    />
                  </label>

                  {error && <p className="text-sm text-red-700">{error}</p>}

                  <button
                    type="button"
                    disabled={
                      !canCheckout || !customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || submitting
                    }
                    onClick={handleCheckout}
                    className="pop-click w-full border border-hairline py-2 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-ink enabled:hover:text-cream"
                  >
                    {submitting
                      ? "Redirecting to payment…"
                      : totalPence
                        ? `Checkout — pay £${(totalPence / 100).toFixed(2)}`
                        : "Checkout"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setFullscreenImage(null)}
          className="fade-scale-in fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4"
        >
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            aria-label="Close"
            className="pop-click absolute right-4 top-4 text-3xl text-cream/80 hover:text-bronze"
          >
            &times;
          </button>
          <Image
            src={fullscreenImage.url}
            alt={fullscreenImage.alt}
            width={1200}
            height={1200}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
