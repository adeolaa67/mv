"use client";

import { useEffect, useState } from "react";
import { ServiceCategory } from "@/lib/types";
import { AddOn } from "@/lib/addOns";

type AddOnsEditorProps = {
  categories: ServiceCategory[];
};

type DraftItem = { id: string; name: string; price: string };

export default function AddOnsEditor({ categories }: AddOnsEditorProps) {
  const [drafts, setDrafts] = useState<Record<string, DraftItem[]>>({});
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
        const response = await fetch("/api/admin/addons");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load add-ons.");
        if (!cancelled) {
          const byCategory: Record<string, AddOn[]> = data.addOnsByCategory;
          const next: Record<string, DraftItem[]> = {};
          for (const category of categories) {
            next[category.slug] = (byCategory[category.slug] ?? []).map((item) => ({
              id: item.id,
              name: item.name,
              price: (item.pricePence / 100).toFixed(2),
            }));
          }
          setDrafts(next);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load add-ons.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow(slug: string) {
    setDrafts((prev) => ({
      ...prev,
      [slug]: [...(prev[slug] ?? []), { id: "", name: "", price: "" }],
    }));
  }

  function removeRow(slug: string, index: number) {
    setDrafts((prev) => ({
      ...prev,
      [slug]: prev[slug].filter((_, i) => i !== index),
    }));
  }

  function updateRow(slug: string, index: number, field: "name" | "price", value: string) {
    setDrafts((prev) => ({
      ...prev,
      [slug]: prev[slug].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  }

  async function handleSave(slug: string) {
    const rows = drafts[slug] ?? [];
    const items = [];
    for (const row of rows) {
      if (!row.name.trim()) continue;
      const pounds = Number(row.price);
      if (!Number.isFinite(pounds) || pounds <= 0) {
        setError(`Give "${row.name}" a price greater than £0 before saving.`);
        return;
      }
      items.push({ id: row.id || undefined, name: row.name.trim(), pricePence: Math.round(pounds * 100) });
    }

    setSaving(slug);
    setError(null);
    setSavedSlug(null);
    try {
      const response = await fetch("/api/admin/addons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug: slug, items }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save add-ons.");
      setDrafts((prev) => ({
        ...prev,
        [slug]: data.items.map((item: AddOn) => ({
          id: item.id,
          name: item.name,
          price: (item.pricePence / 100).toFixed(2),
        })),
      }));
      setSavedSlug(slug);
      setTimeout(() => setSavedSlug((current) => (current === slug ? null : current)), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save add-ons.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 border border-hairline bg-white/40 px-6 py-8">
      <p className="text-xs uppercase tracking-widest text-ink/50">
        Optional extras customers can tick alongside each service — each adds its price to the total
      </p>

      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}

      {categories.map((category) => (
        <div key={category.slug} className="space-y-2 border-t border-hairline pt-4 first:border-t-0 first:pt-0">
          <p className="text-sm font-medium">{category.name}</p>
          {(drafts[category.slug] ?? []).map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Curls"
                value={row.name}
                onChange={(e) => updateRow(category.slug, i, "name", e.target.value)}
                className="flex-1 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <span className="text-sm text-ink/50">£</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(e) => updateRow(category.slug, i, "price", e.target.value)}
                className="w-20 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeRow(category.slug, i)}
                aria-label="Remove add-on"
                className="text-ink/50 hover:text-red-600"
              >
                &times;
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addRow(category.slug)}
              className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream"
            >
              Add extra
            </button>
            <button
              type="button"
              disabled={saving === category.slug}
              onClick={() => handleSave(category.slug)}
              className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving === category.slug ? "Saving…" : savedSlug === category.slug ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
