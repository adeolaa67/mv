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
  const [copySource, setCopySource] = useState<Record<string, string>>({});
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
              price: item.pricePence > 0 ? (item.pricePence / 100).toFixed(2) : "",
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

  // Copies another category's draft list over this one's — ids are stripped
  // so the save assigns fresh ones, keeping each category's items distinct
  // even though they started as duplicates. Doesn't save by itself; the
  // admin still has to hit Save to persist it.
  function copyFrom(targetSlug: string, sourceSlug: string) {
    if (!sourceSlug) return;
    const source = drafts[sourceSlug] ?? [];
    setDrafts((prev) => ({
      ...prev,
      [targetSlug]: source.map((row) => ({ id: "", name: row.name, price: row.price })),
    }));
    setError(null);
    setSavedSlug(null);
  }

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
      // Blank price means free — only validate it when something was typed.
      const pounds = row.price.trim() === "" ? 0 : Number(row.price);
      if (!Number.isFinite(pounds) || pounds < 0) {
        setError(`"${row.name}" has an invalid price.`);
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
          price: item.pricePence > 0 ? (item.pricePence / 100).toFixed(2) : "",
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
        Optional extras customers can tick alongside each service — leave the price blank for a free extra
      </p>

      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}

      {categories.map((category) => (
        <div key={category.slug} className="space-y-2 border-t border-hairline pt-4 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{category.name}</p>
            <div className="flex items-center gap-2">
              <select
                value={copySource[category.slug] ?? ""}
                onChange={(e) => setCopySource((prev) => ({ ...prev, [category.slug]: e.target.value }))}
                className="border border-hairline bg-transparent px-2 py-1 text-xs"
              >
                <option value="">Copy list from…</option>
                {categories
                  .filter((c) => c.slug !== category.slug)
                  .map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!copySource[category.slug]}
                onClick={() => copyFrom(category.slug, copySource[category.slug])}
                className="border border-hairline px-2 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                Copy
              </button>
            </div>
          </div>
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
                placeholder="Free"
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
