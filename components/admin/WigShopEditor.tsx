"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileInputButton, resizeImageFile } from "./FileInputButton";
import { WigProduct, WigVariant, WIG_PRODUCT_IDS } from "@/lib/wigProducts";

type VariantDraft = { id: string; length: string; texture: string; lace: string; price: string };
type ProductDraft = { name: string; description: string; imageUrl: string; variants: VariantDraft[] };

function toDraft(p: WigProduct): ProductDraft {
  return {
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    variants: p.variants.map((v) => ({ id: v.id, length: v.length, texture: v.texture, lace: v.lace, price: (v.pricePence / 100).toFixed(2) })),
  };
}

export default function WigShopEditor() {
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/wigproducts");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load wig products.");
      const next: Record<string, ProductDraft> = {};
      for (const p of data.products as WigProduct[]) next[p.id] = toDraft(p);
      setDrafts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wig products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateProduct(id: string, field: "name" | "description", value: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function addVariant(id: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], variants: [...prev[id].variants, { id: "", length: "", texture: "", lace: "", price: "" }] },
    }));
  }

  function removeVariant(id: string, index: number) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], variants: prev[id].variants.filter((_, i) => i !== index) },
    }));
  }

  function updateVariant(id: string, index: number, field: keyof VariantDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        variants: prev[id].variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
      },
    }));
  }

  async function handleUpload(id: string, file: File) {
    setUploading(id);
    setError(null);
    try {
      const resized = await resizeImageFile(file);
      const formData = new FormData();
      formData.append("file", resized, "upload.jpg");
      formData.append("target", "wigProduct");
      formData.append("productId", id);
      const response = await fetch("/api/admin/images", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to upload image.");
      setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], imageUrl: data.url } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft.name.trim()) {
      setError("Give the wig a name before saving.");
      return;
    }
    const variants: (Omit<WigVariant, "id"> & { id?: string })[] = [];
    for (const v of draft.variants) {
      if (!v.length.trim() && !v.texture.trim() && !v.lace.trim() && !v.price.trim()) continue;
      const pounds = Number(v.price);
      if (!v.length.trim() || !v.texture.trim() || !v.lace.trim() || !Number.isFinite(pounds) || pounds <= 0) {
        setError("Each variant needs a length, texture, lace, and a price greater than £0.");
        return;
      }
      variants.push({ id: v.id || undefined, length: v.length.trim(), texture: v.texture.trim(), lace: v.lace.trim(), pricePence: Math.round(pounds * 100) });
    }

    setSaving(id);
    setError(null);
    setSavedId(null);
    try {
      const response = await fetch("/api/admin/wigproducts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: draft.name, description: draft.description, variants }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save.");
      setDrafts((prev) => ({
        ...prev,
        [id]: { ...prev[id], variants: data.variants.map((v: WigVariant) => ({ id: v.id, length: v.length, texture: v.texture, lace: v.lace, price: (v.pricePence / 100).toFixed(2) })) },
      }));
      setSavedId(id);
      setTimeout(() => setSavedId((current) => (current === id ? null : current)), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
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
    <div className="mx-auto max-w-2xl space-y-8 border border-hairline bg-white/40 px-6 py-8">
      <p className="text-xs uppercase tracking-widest text-ink/50">
        4 wigs for sale — each combination of length, texture, and lace has its own price
      </p>

      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}

      {WIG_PRODUCT_IDS.map((id) => {
        const draft = drafts[id];
        if (!draft) return null;
        return (
          <div key={id} className="space-y-3 border-t border-hairline pt-6 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-4">
              {draft.imageUrl && (
                <Image src={draft.imageUrl} alt={draft.name} width={64} height={64} className="h-16 w-16 object-cover" />
              )}
              <FileInputButton
                label={uploading === id ? "Uploading…" : "Choose photo"}
                disabled={uploading === id}
                onSelect={(file) => handleUpload(id, file)}
              />
            </div>
            <input
              type="text"
              placeholder="Wig name"
              value={draft.name}
              onChange={(e) => updateProduct(id, "name", e.target.value)}
              className="w-full border border-hairline bg-transparent px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              placeholder="Description"
              value={draft.description}
              onChange={(e) => updateProduct(id, "description", e.target.value)}
              className="w-full border border-hairline bg-transparent px-3 py-2 text-sm"
            />

            <p className="text-xs uppercase tracking-widest text-ink/50">Variants (length / texture / lace / price)</p>
            {draft.variants.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Length e.g. 22&quot;"
                  value={v.length}
                  onChange={(e) => updateVariant(id, i, "length", e.target.value)}
                  className="w-24 border border-hairline bg-transparent px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  placeholder="Texture e.g. Straight"
                  value={v.texture}
                  onChange={(e) => updateVariant(id, i, "texture", e.target.value)}
                  className="w-28 border border-hairline bg-transparent px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  placeholder="Lace e.g. 13x4 HD"
                  value={v.lace}
                  onChange={(e) => updateVariant(id, i, "lace", e.target.value)}
                  className="w-28 border border-hairline bg-transparent px-2 py-1 text-sm"
                />
                <span className="text-sm text-ink/50">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(id, i, "price", e.target.value)}
                  className="w-20 border border-hairline bg-transparent px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(id, i)}
                  aria-label="Remove variant"
                  className="text-ink/50 hover:text-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addVariant(id)}
                className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream"
              >
                Add variant
              </button>
              <button
                type="button"
                disabled={saving === id}
                onClick={() => handleSave(id)}
                className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving === id ? "Saving…" : savedId === id ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
