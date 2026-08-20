"use client";

import { useEffect, useRef, useState } from "react";
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

// A plain <input type="file"> is occasionally unresponsive to taps on mobile
// browsers once it's been styled/shrunk (tiny native hit target, or a
// touch-event quirk on some iOS/Android browser builds). A <label> wrapping
// a visually-hidden input is the standard, most reliable cross-browser fix —
// the whole label area becomes the tap target and forwards the click to the
// input natively, no JS click-forwarding needed.
function FileInputButton({
  label,
  disabled,
  onSelect,
}: {
  label: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <label
      className={`inline-block cursor-pointer border border-hairline px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-ink hover:text-cream"
      }`}
    >
      {label}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
        className="sr-only"
      />
    </label>
  );
}

export default function ImageManager() {
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [services, setServices] = useState<ServiceImage[]>([]);
  const [stylistAvatar, setStylistAvatar] = useState<string | null>(null);
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
