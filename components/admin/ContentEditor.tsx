"use client";

import { useEffect, useState } from "react";
import { SiteContent } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-ink/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass = "w-full border border-hairline bg-transparent px-3 py-2 text-sm";

export default function ContentEditor() {
  const [content, setContent] = useState<SiteContent | null>(null);
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
        const response = await fetch("/api/admin/content");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load content.");
        if (!cancelled) setContent(data.content);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load content.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: { tagline: content.brand.tagline, location: content.brand.location },
          stylist: { bio: content.stylist.bio },
          hours: content.hours,
          contact: content.contact.map((c) => ({ label: c.label })),
          policies: content.policies.map((p) => ({ title: p.title, body: p.body })),
          purchaseGuide: content.purchaseGuide,
          services: content.services.map((s) => ({
            name: s.name,
            description: s.description,
            care: s.care,
            duration: s.duration,
            priceFrom: s.priceFrom,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save content.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="mx-auto max-w-2xl border border-hairline bg-white/40 px-6 py-8">
        <p className="text-sm text-red-600">{error ?? "Failed to load content."}</p>
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
        <p className="text-xs uppercase tracking-widest text-ink/50">Brand</p>
        <Field label="Tagline">
          <input
            className={inputClass}
            value={content.brand.tagline}
            onChange={(e) => setContent({ ...content, brand: { ...content.brand, tagline: e.target.value } })}
          />
        </Field>
        <Field label="Location">
          <input
            className={inputClass}
            value={content.brand.location}
            onChange={(e) => setContent({ ...content, brand: { ...content.brand, location: e.target.value } })}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Your bio</p>
        <Field label="Bio">
          <textarea
            rows={4}
            className={inputClass}
            value={content.stylist.bio}
            onChange={(e) => setContent({ ...content, stylist: { ...content.stylist, bio: e.target.value } })}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Hours</p>
        {content.hours.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputClass}
              value={row.label}
              placeholder="Days"
              onChange={(e) => {
                const hours = [...content.hours];
                hours[i] = { ...hours[i], label: e.target.value };
                setContent({ ...content, hours });
              }}
            />
            <input
              className={inputClass}
              value={row.time}
              placeholder="Time"
              onChange={(e) => {
                const hours = [...content.hours];
                hours[i] = { ...hours[i], time: e.target.value };
                setContent({ ...content, hours });
              }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink/50">Contact</p>
        {content.contact.map((row, i) => (
          <Field key={i} label={row.icon}>
            <input
              className={inputClass}
              value={row.label}
              onChange={(e) => {
                const contact = [...content.contact];
                contact[i] = { ...contact[i], label: e.target.value };
                setContent({ ...content, contact });
              }}
            />
          </Field>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-ink/50">Policies</p>
        {content.policies.map((row, i) => (
          <div key={i} className="space-y-2 border-t border-hairline pt-3 first:border-t-0 first:pt-0">
            <Field label="Title">
              <input
                className={inputClass}
                value={row.title}
                onChange={(e) => {
                  const policies = [...content.policies];
                  policies[i] = { ...policies[i], title: e.target.value };
                  setContent({ ...content, policies });
                }}
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={3}
                className={inputClass}
                value={row.body}
                onChange={(e) => {
                  const policies = [...content.policies];
                  policies[i] = { ...policies[i], body: e.target.value };
                  setContent({ ...content, policies });
                }}
              />
            </Field>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-ink/50">Hair purchase guide</p>
        {content.purchaseGuide.map((row, i) => (
          <div key={i} className="space-y-2 border-t border-hairline pt-3 first:border-t-0 first:pt-0">
            <Field label="Title">
              <input
                className={inputClass}
                value={row.title}
                onChange={(e) => {
                  const purchaseGuide = [...content.purchaseGuide];
                  purchaseGuide[i] = { ...purchaseGuide[i], title: e.target.value };
                  setContent({ ...content, purchaseGuide });
                }}
              />
            </Field>
            <Field label="Body">
              <textarea
                rows={2}
                className={inputClass}
                value={row.body}
                onChange={(e) => {
                  const purchaseGuide = [...content.purchaseGuide];
                  purchaseGuide[i] = { ...purchaseGuide[i], body: e.target.value };
                  setContent({ ...content, purchaseGuide });
                }}
              />
            </Field>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-ink/50">
          Services (duration &amp; fallback price text — the real price customers pay is set above)
        </p>
        {content.services.map((row, i) => (
          <div key={i} className="space-y-2 border-t border-hairline pt-3 first:border-t-0 first:pt-0">
            <Field label="Name">
              <input
                className={inputClass}
                value={row.name}
                onChange={(e) => {
                  const services = [...content.services];
                  services[i] = { ...services[i], name: e.target.value };
                  setContent({ ...content, services });
                }}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={2}
                className={inputClass}
                value={row.description}
                onChange={(e) => {
                  const services = [...content.services];
                  services[i] = { ...services[i], description: e.target.value };
                  setContent({ ...content, services });
                }}
              />
            </Field>
            <Field label="Care taken">
              <textarea
                rows={2}
                className={inputClass}
                value={row.care}
                onChange={(e) => {
                  const services = [...content.services];
                  services[i] = { ...services[i], care: e.target.value };
                  setContent({ ...content, services });
                }}
              />
            </Field>
            <div className="flex gap-2">
              <Field label="Duration">
                <input
                  className={inputClass}
                  value={row.duration}
                  onChange={(e) => {
                    const services = [...content.services];
                    services[i] = { ...services[i], duration: e.target.value };
                    setContent({ ...content, services });
                  }}
                />
              </Field>
              <Field label="Fallback price text">
                <input
                  className={inputClass}
                  value={row.priceFrom}
                  onChange={(e) => {
                    const services = [...content.services];
                    services[i] = { ...services[i], priceFrom: e.target.value };
                    setContent({ ...content, services });
                  }}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="w-full border border-hairline py-2 text-sm uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-ink enabled:hover:text-cream"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save all text"}
      </button>
    </div>
  );
}
