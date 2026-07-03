"use client";

import { useRouter } from "next/navigation";
import { ServiceCategory } from "@/lib/types";
import { CategoryIcon } from "./icons";

type CategorySelectorProps = {
  id?: string;
  categories: ServiceCategory[];
};

// Client component: owns the selection interaction itself so the parent
// (a server component) never needs to pass a function prop across the
// server/client boundary. Swap handleSelect for your real booking flow.
export default function CategorySelector({ id, categories }: CategorySelectorProps) {
  const router = useRouter();

  function handleSelect(category: ServiceCategory) {
    router.push(`/book/${category.slug}`);
  }

  return (
    <section id={id} className="px-6 pb-20">
      <div className="mx-auto flex max-w-2xl items-center gap-3 pb-6">
        <CategoryIcon />
        <h2 className="font-display text-xl md:text-2xl">Select Category</h2>
      </div>

      <div className="mx-auto max-w-2xl divide-y divide-hairline border border-hairline bg-white/40">
        {categories.map((category) => (
          <div
            key={category.slug}
            className="flex items-center justify-between gap-4 px-6 py-7"
          >
            <span className="font-display text-lg md:text-xl">{category.name}</span>
            <button
              type="button"
              onClick={() => handleSelect(category)}
              className="shrink-0 bg-ink px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-cream transition-opacity hover:opacity-90"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
