"use client";

import { useRef, useState } from "react";
import { CalendarIcon } from "./icons";
import { ServiceCategory } from "@/lib/types";
import { SLOTS } from "@/lib/slots";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type BookingCalendarProps = {
  id?: string;
  unavailableDates: string[];
  bookedSlotsByDate: Record<string, string[]>;
  categories: ServiceCategory[];
  pricesPence: Record<string, number>;
};

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Date.parse("yyyy-mm-dd") reads as UTC midnight, which can roll back a day
// in negative-UTC-offset timezones — build the Date from local parts instead.
function fromISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function BookingCalendar({
  id,
  unavailableDates,
  bookedSlotsByDate,
  categories,
  pricesPence,
}: BookingCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [shaking, setShaking] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [categorySlug, setCategorySlug] = useState("");
  const [subOption, setSubOption] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const selectedPricePence = selectedCategory ? pricesPence[selectedCategory.slug] : undefined;
  const bookedSlotsForFocusedDate = focusedDate ? bookedSlotsByDate[focusedDate] ?? [] : [];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const today = toISODate(new Date());

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  // The "camera" zooms toward wherever the clicked date sits in the card, so
  // the scale transform needs to originate from that cell, not the center.
  function handleDayClick(e: React.MouseEvent<HTMLButtonElement>, iso: string, isPast: boolean, isUnavailable: boolean) {
    if (isPast || isUnavailable) {
      setShaking(iso);
      setTimeout(() => setShaking(null), 400);
      return;
    }
    const cell = e.currentTarget.getBoundingClientRect();
    const card = cardRef.current?.getBoundingClientRect();
    if (card) {
      const x = ((cell.left + cell.width / 2 - card.left) / card.width) * 100;
      const y = ((cell.top + cell.height / 2 - card.top) / card.height) * 100;
      setZoomOrigin(`${x}% ${y}%`);
    }
    setSlot(null);
    setCategorySlug("");
    setSubOption("");
    setError(null);
    setFocusedDate(iso);
  }

  function handleBack() {
    setFocusedDate(null);
    setSlot(null);
    setCategorySlug("");
    setSubOption("");
    setError(null);
  }

  function handleSelectSlot(s: string) {
    setSlot(s);
    setCategorySlug("");
    setSubOption("");
    setError(null);
  }

  function handleSelectCategory(slug: string) {
    setCategorySlug(slug);
    setSubOption("");
  }

  async function handleBook() {
    if (!focusedDate || !slot || !categorySlug || !subOption) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: focusedDate,
          slot,
          categorySlug,
          subOption,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong — please try again.");
        setSubmitting(false);
        return;
      }
      // Leaving the page for Stripe Checkout — no need to clear `submitting`,
      // this component is about to unmount.
      window.location.href = data.url;
    } catch {
      setError("Something went wrong — please try again.");
      setSubmitting(false);
    }
  }

  const focusedDay = focusedDate ? fromISODate(focusedDate).getDate() : null;

  return (
    <section id={id} className="px-6 pb-20">
      <div className="mx-auto flex max-w-2xl items-center gap-3 pb-6">
        <CalendarIcon />
        <h2 className="font-display text-xl md:text-2xl">Pick a Date</h2>
      </div>

      <div
        ref={cardRef}
        className="relative mx-auto min-h-[420px] max-w-2xl overflow-hidden border border-hairline bg-white/40 px-6 py-8"
      >
        <div
          style={{ transformOrigin: zoomOrigin }}
          className={`transition-all duration-500 ease-in ${
            focusedDate ? "pointer-events-none scale-[8] opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              ‹
            </button>
            <span className="font-display text-sm uppercase tracking-widest2">{monthLabel}</span>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>

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
              const isUnavailable = unavailableDates.includes(iso);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={(e) => handleDayClick(e, iso, isPast, isUnavailable)}
                  className={`py-2 transition-colors ${
                    isPast
                      ? "cursor-not-allowed text-ink/25"
                      : isUnavailable
                        ? "cursor-not-allowed text-ink/40 line-through"
                        : "hover:bg-ink/10"
                  } ${shaking === iso ? "animate-shake" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{ transformOrigin: zoomOrigin }}
          className={`absolute inset-0 flex flex-col items-center overflow-y-auto px-6 py-8 transition-all duration-500 ease-out ${
            focusedDate ? "scale-100 opacity-100" : "pointer-events-none scale-0 opacity-0"
          }`}
        >
          <p className="font-display text-8xl text-bronze">{focusedDay}</p>

          <div className="mt-6 w-full max-w-xs">
            <p className="mb-3 text-center text-xs uppercase tracking-widest text-ink/60">
              Available Slots
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SLOTS.map((s) => {
                const isTaken = bookedSlotsForFocusedDate.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isTaken}
                    onClick={() => handleSelectSlot(s)}
                    className={`border border-hairline py-2 text-sm transition-colors ${
                      isTaken
                        ? "cursor-not-allowed text-ink/25 line-through"
                        : slot === s
                          ? "bg-ink text-cream"
                          : "hover:bg-ink/10"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {slot && (
              <div className="mt-5 space-y-3 text-left">
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-ink/60">Category</span>
                  <select
                    name="category"
                    value={categorySlug}
                    onChange={(e) => handleSelectCategory(e.target.value)}
                    className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                  >
                    <option value="">Choose a category…</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedCategory && (
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-ink/60">
                      Sub-category
                    </span>
                    <select
                      name="subCategory"
                      value={subOption}
                      onChange={(e) => setSubOption(e.target.value)}
                      className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="">Choose an option…</option>
                      {selectedCategory.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subOption && (
                  <>
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-ink/60">Name</span>
                      <input
                        type="text"
                        name="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-ink/60">Email</span>
                      <input
                        type="email"
                        name="customerEmail"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-ink/60">Phone</span>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                  </>
                )}

                {subOption && !selectedPricePence && (
                  <p className="text-sm text-ink/60">
                    Pricing for this service isn&apos;t set up yet — please contact us directly to book.
                  </p>
                )}

                {error && <p className="text-sm text-red-700">{error}</p>}

                <button
                  type="button"
                  disabled={
                    !subOption ||
                    !selectedPricePence ||
                    !customerName.trim() ||
                    !customerEmail.trim() ||
                    !customerPhone.trim() ||
                    submitting
                  }
                  onClick={handleBook}
                  className="w-full border border-hairline py-2 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-ink enabled:hover:text-cream"
                >
                  {submitting
                    ? "Redirecting to payment…"
                    : selectedPricePence
                      ? `Book — pay £${(selectedPricePence / 100).toFixed(2)}`
                      : "Book"}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleBack}
              className="mx-auto mt-6 block text-xs uppercase tracking-widest text-ink/60 hover:text-bronze"
            >
              ‹ Back
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
