"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileInputButton, resizeImageFile } from "./FileInputButton";

type GalleryEntry = { id: string; url: string; caption: string; rating: number; detail: string };
type ServiceImage = { slug: string; name: string; url: string };

export default function ImageManager() {
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [services, setServices] = useState<ServiceImage[]>([]);
  const [stylistAvatar, setStylistAvatar] = useState<string | null>(null);
  const [shopBanner, setShopBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/images");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load images.");
      setGallery(data.gallery);
      setServices(data.services);
      setStylistAvatar(data.stylistAvatar);
      setShopBanner(data.shopBanner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadFile(file: File, extra: Record<string, string>, busyKey: string) {
    setBusy(busyKey);
    setError(null);
    try {
      const resized = await resizeImageFile(file);
      const formData = new FormData();
      formData.append("file", resized, "upload.jpg");
      for (const [key, value] of Object.entries(extra)) formData.append(key, value);
      const response = await fetch("/api/admin/images", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to upload image.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDeleteGalleryPhoto(id: string) {
    setBusy(`gallery-${id}`);
    setError(null);
    try {
      const response = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to delete image.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image.");
    } finally {
      setBusy(null);
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
      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Your photo</p>
        <div className="flex items-center gap-4">
          {stylistAvatar && (
            <Image src={stylistAvatar} alt="Stylist" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
          )}
          <FileInputButton
            label={busy === "stylist" ? "Uploading…" : "Choose photo"}
            disabled={busy === "stylist"}
            onSelect={(file) => uploadFile(file, { target: "stylist" }, "stylist")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Shop Ade&apos;s Hair banner image</p>
        <div className="flex items-center gap-4">
          {shopBanner && (
            <Image src={shopBanner} alt="Shop banner" width={96} height={64} className="h-16 w-24 object-cover" />
          )}
          <FileInputButton
            label={busy === "shopBanner" ? "Uploading…" : "Choose photo"}
            disabled={busy === "shopBanner"}
            onSelect={(file) => uploadFile(file, { target: "shopBanner" }, "shopBanner")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Service images</p>
        {services.map((s) => (
          <div key={s.slug} className="flex items-center gap-4">
            {s.url && (
              <Image src={s.url} alt={s.name} width={64} height={64} className="h-16 w-16 object-cover" />
            )}
            <span className="flex-1 text-sm">{s.name}</span>
            <FileInputButton
              label={busy === `service-${s.slug}` ? "Uploading…" : "Choose photo"}
              disabled={busy === `service-${s.slug}`}
              onSelect={(file) => uploadFile(file, { target: "service", categorySlug: s.slug }, `service-${s.slug}`)}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Gallery photos</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {gallery.map((entry) => (
            <div key={entry.id} className="relative">
              <Image
                src={entry.url}
                alt={entry.caption || "Gallery photo"}
                width={120}
                height={150}
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                disabled={busy === `gallery-${entry.id}`}
                onClick={() => handleDeleteGalleryPhoto(entry.id)}
                className="absolute right-1 top-1 bg-ink/70 px-1.5 py-0.5 text-xs text-cream hover:bg-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-hairline pt-4">
          <FileInputButton
            label={busy === "gallery-new" ? "Uploading…" : "Add a photo"}
            disabled={busy === "gallery-new"}
            onSelect={(file) => uploadFile(file, { target: "gallery" }, "gallery-new")}
          />
        </div>
      </div>
    </div>
  );
}
