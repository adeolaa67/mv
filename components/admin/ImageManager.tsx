"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type GalleryEntry = { id: string; url: string; caption: string; rating: number; detail: string };
type ServiceImage = { slug: string; name: string; url: string };

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// Phone camera photos are often 5-10MB — resize/re-encode client-side before
// upload so they're fast to send and stay well under the server's size cap.
function resizeImageFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to process image."))),
        "image/jpeg",
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image."));
    };
    img.src = url;
  });
}

export default function ImageManager() {
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [services, setServices] = useState<ServiceImage[]>([]);
  const [stylistAvatar, setStylistAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [newCaption, setNewCaption] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newDetail, setNewDetail] = useState("");

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

  async function handleAddGalleryPhoto(file: File) {
    await uploadFile(
      file,
      { target: "gallery", caption: newCaption, rating: String(newRating), detail: newDetail },
      "gallery-new",
    );
    setNewCaption("");
    setNewRating(5);
    setNewDetail("");
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
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy === "stylist"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, { target: "stylist" }, "stylist");
              e.target.value = "";
            }}
            className="text-sm"
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
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy === `service-${s.slug}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file, { target: "service", categorySlug: s.slug }, `service-${s.slug}`);
                e.target.value = "";
              }}
              className="text-xs"
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

        <div className="space-y-2 border-t border-hairline pt-4">
          <p className="text-xs uppercase tracking-widest text-ink/50">Add a photo</p>
          <input
            type="text"
            placeholder="Caption"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            className="w-full border border-hairline bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            rows={2}
            placeholder="Review detail (optional)"
            value={newDetail}
            onChange={(e) => setNewDetail(e.target.value)}
            className="w-full border border-hairline bg-transparent px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-widest text-ink/50">Rating</label>
            <select
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              className="border border-hairline bg-transparent px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy === "gallery-new"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAddGalleryPhoto(file);
              e.target.value = "";
            }}
            className="text-sm"
          />
          {busy === "gallery-new" && <p className="text-xs text-ink/50">Uploading…</p>}
        </div>
      </div>
    </div>
  );
}
