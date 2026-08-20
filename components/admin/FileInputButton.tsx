"use client";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// Phone camera photos are often 5-10MB — resize/re-encode client-side before
// upload so they're fast to send and stay well under the server's size cap.
export function resizeImageFile(file: File): Promise<Blob> {
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
export function FileInputButton({
  label,
  disabled,
  onSelect,
}: {
  label: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
}) {
  return (
    <label
      className={`inline-block cursor-pointer border border-hairline px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-ink hover:text-cream"
      }`}
    >
      {label}
      <input
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
