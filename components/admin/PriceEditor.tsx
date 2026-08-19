"use client";

import { useEffect, useState } from "react";
import { ServiceCategory } from "@/lib/types";

type PriceEditorProps = {
  categories: ServiceCategory[];
};

// Prices are edited in pounds (what the admin thinks in) but stored/sent as
// pence (what Stripe and the checkout route need) — this component is the
// only place that converts between the two.
export default function PriceEditor({ categories }: PriceEditorProps) {
  const [pricesPence, setPricesPence] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/prices");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load prices.");
        if (!cancelled) {
          setPricesPence(data.prices);
          const nextDrafts: Record<string, string> = {};
          for (const category of categories) {
            const pence = data.prices[category.slug];
            nextDrafts[category.slug] = typeof pence === "number" ? (pence / 100).toFixed(2) : "";
          }
          setDrafts(nextDrafts);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load prices.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // categories is static content, safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(slug: string) {
    const pounds = Number(drafts[slug]);
    if (!Number.isFinite(pounds) || pounds <= 0) {
      setError("Enter a price greater than £0 before saving.");
      return;
    }
    setSaving(slug);
    setError(null);
    setSavedSlug(null);
    try {
      const pricePence = Math.round(pounds * 100);
      const response = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug: slug, pricePence }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save price.");
      setPricesPence((prev) => ({ ...prev, [slug]: pricePence }));
      setSavedSlug(slug);
      setTimeout(() => setSavedSlug((current) => (current === slug ? null : current)), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save price.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
      <p className="mb-4 text-xs uppercase tracking-widest text-ink/50">
        Set the full price customers pay online to book each service
      </p>

      {error && (
        <p role="alert" className="mb-4 text-center text-xs text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const hasSavedPrice = typeof pricesPence[category.slug] === "number";
            return (
              <div key={category.slug} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{category.name}</span>
                <span className="text-sm text-ink/50">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={drafts[category.slug] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [category.slug]: e.target.value }))
                  }
                  className="w-24 border border-hairline bg-transparent px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  disabled={saving === category.slug}
                  onClick={() => handleSave(category.slug)}
                  className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving === category.slug ? "Saving…" : savedSlug === category.slug ? "Saved" : "Save"}
                </button>
                {!hasSavedPrice && (
                  <span className="text-xs text-red-600" title="Customers can't book this online yet">
                    Not set
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
