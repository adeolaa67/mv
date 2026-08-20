"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function DateSlotsEditor() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [defaultSlots, setDefaultSlots] = useState<string[]>([]);
  const [overridesByDate, setOverridesByDate] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSlots, setEditingSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [slotsRes, overridesRes] = await Promise.all([
          fetch("/api/admin/slots"),
          fetch("/api/admin/date-slots"),
        ]);
        const slotsData = await slotsRes.json();
        const overridesData = await overridesRes.json();
        if (!slotsRes.ok) throw new Error(slotsData.error ?? "Failed to load default times.");
        if (!overridesRes.ok) throw new Error(overridesData.error ?? "Failed to load date times.");
        if (!cancelled) {
          setDefaultSlots(slotsData.slots);
          setOverridesByDate(overridesData.overrides);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load times.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function selectDate(iso: string) {
    setSelectedDate(iso);
    setEditingSlots(overridesByDate[iso] ?? defaultSlots);
    setError(null);
    setSaved(false);
  }

  function handleRemove(index: number) {
    setEditingSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const trimmed = newSlot.trim();
    if (!trimmed) return;
    if (editingSlots.includes(trimmed)) {
      setError("That time is already in the list.");
      return;
    }
    setEditingSlots((prev) => [...prev, trimmed]);
    setNewSlot("");
    setError(null);
  }

  async function handleSave() {
    if (!selectedDate) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/date-slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, slots: editingSlots }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save.");
      setOverridesByDate((prev) => ({ ...prev, [selectedDate]: editingSlots }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetToDefault() {
    if (!selectedDate) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/date-slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to reset.");
      setOverridesByDate((prev) => {
        const next = { ...prev };
        delete next[selectedDate];
        return next;
      });
      setEditingSlots(defaultSlots);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset.");
    } finally {
      setSaving(false);
    }
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const today = toISODate(new Date());
  const isCustomSelected = selectedDate ? Boolean(overridesByDate[selectedDate]) : false;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

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
        Tap a date to set custom times just for that day
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
          const isCustom = Boolean(overridesByDate[iso]);
          const isSelected = selectedDate === iso;

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => selectDate(iso)}
              className={`relative py-2 transition-colors ${
                isPast
                  ? "cursor-not-allowed text-ink/25"
                  : isSelected
                    ? "bg-ink text-cream"
                    : isCustom
                      ? "bg-bronze/30 hover:bg-bronze/50"
                      : "hover:bg-taupe/20"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-ink/60">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 bg-bronze/30" /> Custom times
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 border border-hairline" /> Default times
        </span>
      </div>

      {selectedDate && (
        <div className="mt-6 border-t border-hairline pt-6">
          <p className="mb-3 text-xs uppercase tracking-widest text-ink/50">
            Times for {selectedDate} {isCustomSelected ? "(custom)" : "(using default)"}
          </p>

          <div className="flex flex-wrap gap-2">
            {editingSlots.map((slot, i) => (
              <span key={slot} className="flex items-center gap-2 border border-hairline px-3 py-1.5 text-sm">
                {slot}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  aria-label={`Remove ${slot}`}
                  className="text-ink/50 hover:text-red-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="e.g. 5:00pm"
              className="flex-1 border border-hairline bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="border border-hairline px-4 py-2 text-xs uppercase tracking-widest transition-colors hover:bg-ink hover:text-cream"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={saving || editingSlots.length === 0}
              onClick={handleSave}
              className="flex-1 border border-hairline py-2 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-ink enabled:hover:text-cream"
            >
              {saving ? "Saving…" : saved ? "Saved" : "Save for this date"}
            </button>
            {isCustomSelected && (
              <button
                type="button"
                disabled={saving}
                onClick={handleResetToDefault}
                className="border border-hairline px-4 py-2 text-xs uppercase tracking-widest text-ink/60 transition-colors hover:bg-ink/10"
              >
                Reset to default
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
