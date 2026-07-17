"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GalleryReview } from "@/lib/types";

type GalleryProps = {
  images: string[];
  reviews: Record<string, GalleryReview>;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className="flex justify-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-bronze" : "text-ink/20"}>
          ★
        </span>
      ))}
    </div>
  );
}

const SPEED = 40; // px/sec
const DRAG_THRESHOLD = 5; // px before a pointer-down counts as a drag, not a click

// Track is the image list twice back-to-back; wrapping the offset by exactly
// half its rendered width (one full set) loops seamlessly with no visible jump.
export default function Gallery({ images, reviews }: GalleryProps) {
  const [active, setActive] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const pausedRef = useRef(false);
  const hoveredRef = useRef(false);

  useEffect(() => {
    pausedRef.current = active !== null || hoveredRef.current;
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;

    function measure() {
      halfWidthRef.current = track!.scrollWidth / 2;
    }
    measure();
    window.addEventListener("resize", measure);

    let lastTime: number | null = null;
    let frame = requestAnimationFrame(tick);

    function tick(time: number) {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const half = halfWidthRef.current;
      if (!pausedRef.current && !draggingRef.current && half > 0) {
        offsetRef.current -= SPEED * dt;
        if (offsetRef.current <= -half) offsetRef.current += half;
        track!.style.transform = `translateX(${offsetRef.current}px)`;
      }
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [images.length]);

  function handlePointerEnter() {
    hoveredRef.current = true;
    pausedRef.current = true;
  }

  function handlePointerLeaveTrack() {
    hoveredRef.current = false;
    pausedRef.current = active !== null;
  }

  function handlePointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ponytail: can throw if the pointer was already released (e.g. a
      // synthetic/replayed event) — capture is a nicety, not required.
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) draggedRef.current = true;

    const half = halfWidthRef.current;
    let next = dragStartOffsetRef.current + delta;
    if (half > 0) {
      while (next <= -half) next += half;
      while (next > 0) next -= half;
    }
    offsetRef.current = next;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${next}px)`;
  }

  function handlePointerUp() {
    draggingRef.current = false;
  }

  function handleTrackLeave() {
    handlePointerUp();
    handlePointerLeaveTrack();
  }

  if (images.length === 0) return null;

  const track = [...images, ...images];
  const activeReview = active ? reviews[active.split("/").pop() ?? ""] : undefined;

  return (
    <section className="pb-14">
      <div className="mx-auto max-w-2xl px-6">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent" />
          <div
            ref={trackRef}
            onPointerEnter={handlePointerEnter}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handleTrackLeave}
            className="flex w-max cursor-grab touch-pan-y select-none items-start gap-4 active:cursor-grabbing"
          >
            {track.map((src, i) => {
              const review = reviews[src.split("/").pop() ?? ""];
              return (
                <div key={`${src}-${i}`} className="w-32 shrink-0 md:w-40">
                  <button
                    type="button"
                    onClick={() => {
                      if (draggedRef.current) return;
                      setActive(src);
                    }}
                    className="block h-40 w-32 overflow-hidden border border-hairline md:h-52 md:w-40"
                  >
                    <Image
                      src={src}
                      alt="Hairstyle by Adeola"
                      width={200}
                      height={260}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  {review && (
                    <div className="mt-2 text-center">
                      <p className="text-xs leading-snug text-ink/70">{review.caption}</p>
                      <div className="mt-1 text-sm">
                        <Stars rating={review.rating} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-6"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute right-6 top-6 text-3xl text-cream"
          >
            &times;
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden bg-cream md:max-w-2xl md:flex-row"
          >
            <Image
              src={active}
              alt="Hairstyle by Adeola"
              width={800}
              height={1000}
              className="max-h-[45vh] w-full object-cover md:max-h-[85vh] md:w-1/2"
            />
            {activeReview && (
              <div className="flex flex-col justify-center gap-3 p-6 text-center md:text-left">
                <Stars rating={activeReview.rating} />
                <p className="font-display text-lg">{activeReview.caption}</p>
                <p className="text-sm leading-relaxed text-ink/70">{activeReview.detail}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
