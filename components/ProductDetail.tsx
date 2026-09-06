"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { WigProduct } from "@/lib/wigProducts";
import ShopPolicyInfo from "./ShopPolicyInfo";

type ProductDetailProps = {
  product: WigProduct;
};

function uniqueInOrder(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [length, setLength] = useState("");
  const [lace, setLace] = useState("");
  const [textureId, setTextureId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Length and lace are each optional on a product — some only vary by one
  // of them, or by neither — so the picker for a dimension only shows up
  // when at least one variant actually has a value for it.
  const lengths = useMemo(() => uniqueInOrder(product.variants.map((v) => v.length)), [product]);
  const laces = useMemo(() => {
    const relevant = lengths.length > 0 ? product.variants.filter((v) => v.length === length) : product.variants;
    return uniqueInOrder(relevant.map((v) => v.lace));
  }, [product, lengths, length]);
  const matchedVariant = product.variants.find(
    (v) => (lengths.length === 0 || v.length === length) && (laces.length === 0 || v.lace === lace),
  );
  const textures = product.textures;
  const selectedTexture = textures.find((t) => t.id === textureId) ?? null;
  const needsTexture = textures.length > 0;
  const canCheckout = Boolean(matchedVariant) && (!needsTexture || Boolean(selectedTexture));
  const unitPence = matchedVariant ? matchedVariant.pricePence + (selectedTexture?.extraPricePence ?? 0) : undefined;
  const totalPence = unitPence != null ? unitPence * quantity : undefined;

  async function handleCheckout() {
    if (!matchedVariant) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
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

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        {product.videoUrl ? (
          <video
            src={product.videoUrl}
            poster={product.imageUrl}
            controls
            playsInline
            className="h-80 w-full border border-hairline object-cover sm:h-[28rem]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="View photo fullscreen"
            className="pop-click block h-80 w-full cursor-zoom-in overflow-hidden border border-hairline sm:h-[28rem]"
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={900}
              height={900}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        )}

        <div className="text-left">
          <p className="font-display text-2xl">{product.name}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-loose text-ink/70">{product.description}</p>

          <div className="mt-10 space-y-6">
            {lengths.length > 0 && (
              <div className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Length</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lengths.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setLength(l);
                        setLace("");
                      }}
                      className={`pop-click border px-3 py-2 text-xs transition-colors ${
                        length === l
                          ? "border-bronze bg-bronze text-cream"
                          : "border-hairline text-ink/70 hover:border-bronze hover:text-bronze"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {laces.length > 0 && (lengths.length === 0 || length) && (
              <div className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Lace</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {laces.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLace(l)}
                      className={`pop-click border px-3 py-2 text-xs transition-colors ${
                        lace === l
                          ? "border-bronze bg-bronze text-cream"
                          : "border-hairline text-ink/70 hover:border-bronze hover:text-bronze"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {matchedVariant && textures.length > 0 && (
              <div className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Texture</span>
                <div className="mt-2 flex flex-wrap gap-2">
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
              <div className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Quantity</span>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="pop-click flex h-10 w-10 items-center justify-center border border-hairline text-lg text-ink/70 transition-colors hover:border-bronze hover:text-bronze"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    aria-label="Increase quantity"
                    className="pop-click flex h-10 w-10 items-center justify-center border border-hairline text-lg text-ink/70 transition-colors hover:border-bronze hover:text-bronze"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {matchedVariant && (
            <div className="mt-10 space-y-4 border-t border-hairline pt-8">
              <p className="text-xs uppercase tracking-widest text-ink/50">Your Details</p>

              <label className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Name</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full border border-hairline bg-transparent px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Email</span>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-1 w-full border border-hairline bg-transparent px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-ink/60">Phone</span>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 w-full border border-hairline bg-transparent px-3 py-2.5 text-sm"
                />
              </label>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <button
                type="button"
                disabled={
                  !canCheckout || !customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || submitting
                }
                onClick={handleCheckout}
                className="pop-click w-full border border-hairline py-3.5 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-ink enabled:hover:text-cream"
              >
                {submitting
                  ? "Redirecting to payment…"
                  : totalPence
                    ? `Checkout — pay £${(totalPence / 100).toFixed(2)}`
                    : "Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ShopPolicyInfo />

      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setFullscreen(false)}
          className="fade-scale-in fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close"
            className="pop-click absolute right-4 top-4 text-3xl text-cream/80 hover:text-bronze"
          >
            &times;
          </button>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={1200}
            height={1200}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
