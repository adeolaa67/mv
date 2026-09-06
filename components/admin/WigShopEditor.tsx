"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileInputButton, resizeImageFile } from "./FileInputButton";
import { PRODUCT_CATEGORIES, ProductCategorySlug, WigProduct, WigVariant, WigTexture } from "@/lib/wigProducts";

type VariantDraft = { id: string; length: string; lace: string; price: string };
type TextureDraft = { id: string; name: string; extraPrice: string };
type ProductDraft = {
  id: string;
  category: ProductCategorySlug;
  name: string;
  description: string;
  imageUrl: string;
  variants: VariantDraft[];
  textures: TextureDraft[];
};

function toDraft(p: WigProduct): ProductDraft {
  return {
    id: p.id,
    category: p.category,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    variants: p.variants.map((v) => ({
      id: v.id,
      length: v.length,
      lace: v.lace,
      price: (v.pricePence / 100).toFixed(2),
    })),
    textures: (p.textures ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      extraPrice: t.extraPricePence > 0 ? (t.extraPricePence / 100).toFixed(2) : "",
    })),
  };
}

export default function WigShopEditor() {
  const [activeCategory, setActiveCategory] = useState<ProductCategorySlug>("wigs");
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copySource, setCopySource] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/wigproducts");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load products.");
      setProducts((data.products as WigProduct[]).map(toDraft));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateProduct(id: string, field: "name" | "description", value: string) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  // Copies another product's whole variants + textures section over this
  // one's — ids are stripped so Save assigns fresh ones, and this only
  // updates the draft, it doesn't save by itself.
  function copyFrom(targetId: string, sourceId: string) {
    if (!sourceId) return;
    const source = products.find((p) => p.id === sourceId);
    if (!source) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === targetId
          ? {
              ...p,
              variants: source.variants.map((v) => ({ ...v, id: "" })),
              textures: source.textures.map((t) => ({ ...t, id: "" })),
            }
          : p,
      ),
    );
    setError(null);
    setSavedId(null);
  }

  function addVariant(id: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, variants: [...p.variants, { id: "", length: "", lace: "", price: "" }] } : p,
      ),
    );
  }

  function removeVariant(id: string, index: number) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, variants: p.variants.filter((_, i) => i !== index) } : p)),
    );
  }

  function updateVariant(id: string, index: number, field: keyof VariantDraft, value: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, variants: p.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)) } : p,
      ),
    );
  }

  function addTexture(id: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, textures: [...p.textures, { id: "", name: "", extraPrice: "" }] } : p,
      ),
    );
  }

  function removeTexture(id: string, index: number) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, textures: p.textures.filter((_, i) => i !== index) } : p)),
    );
  }

  function updateTexture(id: string, index: number, field: keyof TextureDraft, value: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, textures: p.textures.map((t, i) => (i === index ? { ...t, [field]: value } : t)) } : p,
      ),
    );
  }

  async function handleAddProduct() {
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/wigproducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to add product.");
      setProducts((prev) => [...prev, toDraft(data.product)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    setDeleting(id);
    setError(null);
    try {
      const response = await fetch("/api/admin/wigproducts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to delete product.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeleting(null);
    }
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
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, imageUrl: data.url } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave(id: string) {
    const draft = products.find((p) => p.id === id);
    if (!draft) return;
    if (!draft.name.trim()) {
      setError("Give the product a name before saving.");
      return;
    }
    const variants: (Omit<WigVariant, "id"> & { id?: string })[] = [];
    for (const v of draft.variants) {
      if (!v.length.trim() && !v.lace.trim() && !v.price.trim()) continue;
      const pounds = Number(v.price);
      if (!v.length.trim() || !v.lace.trim() || !Number.isFinite(pounds) || pounds <= 0) {
        setError("Each variant needs a length, lace, and a price greater than £0.");
        return;
      }
      variants.push({ id: v.id || undefined, length: v.length.trim(), lace: v.lace.trim(), pricePence: Math.round(pounds * 100) });
    }

    const textures: (Omit<WigTexture, "id"> & { id?: string })[] = [];
    for (const t of draft.textures) {
      if (!t.name.trim()) continue;
      // Blank extra price means no upcharge — only validate it when something was typed.
      const pounds = t.extraPrice.trim() === "" ? 0 : Number(t.extraPrice);
      if (!Number.isFinite(pounds) || pounds < 0) {
        setError(`"${t.name}" has an invalid extra price.`);
        return;
      }
      textures.push({ id: t.id || undefined, name: t.name.trim(), extraPricePence: Math.round(pounds * 100) });
    }

    setSaving(id);
    setError(null);
    setSavedId(null);
    try {
      const response = await fetch("/api/admin/wigproducts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: draft.name, description: draft.description, variants, textures }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save.");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                variants: data.variants.map((v: WigVariant) => ({
                  id: v.id,
                  length: v.length,
                  lace: v.lace,
                  price: (v.pricePence / 100).toFixed(2),
                })),
                textures: data.textures.map((t: WigTexture) => ({
                  id: t.id,
                  name: t.name,
                  extraPrice: t.extraPricePence > 0 ? (t.extraPricePence / 100).toFixed(2) : "",
                })),
              }
            : p,
        ),
      );
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

  const visibleProducts = products.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-2xl space-y-6 border border-hairline bg-white/40 px-6 py-8">
      <div className="flex flex-wrap gap-2">
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActiveCategory(c.slug)}
            className={`border px-3 py-1.5 text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 ${
              activeCategory === c.slug
                ? "border-bronze bg-bronze text-cream"
                : "border-hairline text-ink/60 hover:bg-ink/5"
            }`}
          >
            {c.label} ({products.filter((p) => p.category === c.slug).length})
          </button>
        ))}
      </div>

      <p className="text-xs uppercase tracking-widest text-ink/50">
        Add as many products as you like to {PRODUCT_CATEGORIES.find((c) => c.slug === activeCategory)?.label} —
        each combination of length and lace has its own price. Textures (e.g. Straight, Water Wave) are listed
        separately below and can each carry their own optional extra charge.
      </p>

      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}

      {visibleProducts.length === 0 && (
        <p className="text-sm text-ink/50">No products in this category yet — add the first one below.</p>
      )}

      {visibleProducts.map((draft) => (
        <div key={draft.id} className="space-y-3 border-t border-hairline pt-6 first:border-t-0 first:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              {draft.imageUrl && (
                <Image src={draft.imageUrl} alt={draft.name} width={64} height={64} className="h-16 w-16 object-cover" />
              )}
              <FileInputButton
                label={uploading === draft.id ? "Uploading…" : "Choose photo"}
                disabled={uploading === draft.id}
                onSelect={(file) => handleUpload(draft.id, file)}
              />
            </div>
            {visibleProducts.length > 1 && (
              <div className="flex items-center gap-2">
                <select
                  value={copySource[draft.id] ?? ""}
                  onChange={(e) => setCopySource((prev) => ({ ...prev, [draft.id]: e.target.value }))}
                  className="border border-hairline bg-transparent px-2 py-1 text-xs"
                >
                  <option value="">Copy from…</option>
                  {visibleProducts
                    .filter((p) => p.id !== draft.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || "Untitled product"}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!copySource[draft.id]}
                  onClick={() => copyFrom(draft.id, copySource[draft.id])}
                  className="pop-click border border-hairline px-2 py-1 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Copy
                </button>
              </div>
            )}
            {confirmDeleteId === draft.id ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-ink/60">Delete this product?</span>
                <button
                  type="button"
                  disabled={deleting === draft.id}
                  onClick={() => handleDeleteProduct(draft.id)}
                  className="uppercase tracking-widest text-red-600 hover:underline"
                >
                  {deleting === draft.id ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="uppercase tracking-widest text-ink/60 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(draft.id)}
                className="text-xs uppercase tracking-widest text-ink/40 hover:text-red-600"
              >
                Delete product
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Product name"
            value={draft.name}
            onChange={(e) => updateProduct(draft.id, "name", e.target.value)}
            className="w-full border border-hairline bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={draft.description}
            onChange={(e) => updateProduct(draft.id, "description", e.target.value)}
            className="w-full border border-hairline bg-transparent px-3 py-2 text-sm"
          />

          <p className="text-xs uppercase tracking-widest text-ink/50">Variants (length / lace / price)</p>
          {draft.variants.map((v, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Length e.g. 22&quot;"
                value={v.length}
                onChange={(e) => updateVariant(draft.id, i, "length", e.target.value)}
                className="w-24 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <input
                type="text"
                placeholder="Lace e.g. 13x4 HD"
                value={v.lace}
                onChange={(e) => updateVariant(draft.id, i, "lace", e.target.value)}
                className="w-28 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <span className="text-sm text-ink/50">£</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={v.price}
                onChange={(e) => updateVariant(draft.id, i, "price", e.target.value)}
                className="w-20 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeVariant(draft.id, i)}
                aria-label="Remove variant"
                className="text-ink/50 transition-transform active:scale-90 hover:text-red-600"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addVariant(draft.id)}
            className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 hover:bg-ink hover:text-cream"
          >
            Add variant
          </button>

          <p className="pt-2 text-xs uppercase tracking-widest text-ink/50">
            Textures — leave the extra price blank for no upcharge
          </p>
          {draft.textures.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Texture e.g. Straight"
                value={t.name}
                onChange={(e) => updateTexture(draft.id, i, "name", e.target.value)}
                className="flex-1 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <span className="text-sm text-ink/50">+£</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="No extra charge"
                value={t.extraPrice}
                onChange={(e) => updateTexture(draft.id, i, "extraPrice", e.target.value)}
                className="w-32 border border-hairline bg-transparent px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeTexture(draft.id, i)}
                aria-label="Remove texture"
                className="text-ink/50 transition-transform active:scale-90 hover:text-red-600"
              >
                &times;
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addTexture(draft.id)}
              className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 hover:bg-ink hover:text-cream"
            >
              Add texture
            </button>
            <button
              type="button"
              disabled={saving === draft.id}
              onClick={() => handleSave(draft.id)}
              className="border border-hairline px-3 py-1 text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving === draft.id ? "Saving…" : savedId === draft.id ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      ))}

      <div className="border-t border-hairline pt-6">
        <button
          type="button"
          disabled={creating}
          onClick={handleAddProduct}
          className="border border-hairline px-4 py-2 text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          {creating ? "Adding…" : `+ Add a ${PRODUCT_CATEGORIES.find((c) => c.slug === activeCategory)?.label} product`}
        </button>
      </div>
    </div>
  );
}
