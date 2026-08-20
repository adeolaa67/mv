"use client";

import { useEffect, useState } from "react";

export default function SlotsEditor() {
  const [slots, setSlots] = useState<string[]>([]);
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
        const response = await fetch("/api/admin/slots");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load times.");
        if (!cancelled) setSlots(data.slots);
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

  function handleRemove(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const trimmed = newSlot.trim();
    if (!trimmed) return;
    if (slots.includes(trimmed)) {
      setError("That time is already in the list.");
      return;
    }
    setSlots((prev) => [...prev, trimmed]);
    setNewSlot("");
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save times.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save times.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
      <p className="mb-4 text-xs uppercase tracking-widest text-ink/50">
        Times customers can pick when booking (applies to every open day)
      </p>

      {error && (
        <p role="alert" className="mb-4 text-center text-xs text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot, i) => (
              <span
                key={slot}
                className="flex items-center gap-2 border border-hairline px-3 py-1.5 text-sm"
              >
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

          <button
            type="button"
            disabled={saving || slots.length === 0}
            onClick={handleSave}
            className="mt-6 w-full border border-hairline py-2 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-ink enabled:hover:text-cream"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save times"}
          </button>
        </>
      )}
    </div>
  );
}
