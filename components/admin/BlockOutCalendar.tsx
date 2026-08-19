"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function BlockOutCalendar() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/blocked-dates");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load blocked dates.");
        if (!cancelled) setBlockedDates(new Set<string>(data.dates));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load blocked dates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleDate(iso: string) {
    const isBlocked = blockedDates.has(iso);
    setPending(iso);
    setError(null);

    // Optimistic update — rolled back if the request fails.
    setBlockedDates((prev) => {
      const next = new Set(prev);
      isBlocked ? next.delete(iso) : next.add(iso);
      return next;
    });

    try {
      const response = await fetch("/api/admin/blocked-dates", {
        method: isBlocked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: iso }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update date.");
    } catch (err) {
      setBlockedDates((prev) => {
        const next = new Set(prev);
        isBlocked ? next.add(iso) : next.delete(iso);
        return next;
      });
      setError(err instanceof Error ? err.message : "Failed to update date.");
    } finally {
      setPending(null);
    }
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const today = toISODate(new Date());

  return (
    <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="px-2 text-lg text-ink/70 transition-colors hover:text-bronze"
        >
          ‹
        </button>
        <span className="font-display text-sm uppercase tracking-widest2">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="px-2 text-lg text-ink/70 transition-colors hover:text-bronze"
        >
          ›
        </button>
      </div>

      <p className="mb-4 text-center text-xs uppercase tracking-widest text-ink/50">
        Tap a date to block or unblock it
      </p>

      {error && (
        <p role="alert" className="mb-4 text-center text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {WEEKDAYS.map((day, i) => (
          <span key={i} className="py-1 text-xs text-ink/50">
            {day}
          </span>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const iso = toISODate(new Date(year, month, day));
          const isPast = iso < today;
          const isBlocked = blockedDates.has(iso);
          const isPending = pending === iso;

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || loading || isPending}
              onClick={() => toggleDate(iso)}
              className={`relative py-2 transition-colors ${
                isPast
                  ? "cursor-not-allowed text-ink/25"
                  : isBlocked
                    ? "bg-bronze text-cream"
                    : "hover:bg-taupe/20"
              } ${isPending ? "opacity-50" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ink/60">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 bg-bronze" /> Blocked
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 border border-hairline" /> Open
        </span>
      </div>
    </div>
  );
}
