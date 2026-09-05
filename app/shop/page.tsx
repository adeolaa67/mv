import Link from "next/link";
import { getEffectiveSiteContent } from "@/lib/siteContentOverrides";
import { getWigProducts } from "@/lib/wigProductsServer";
import { PRODUCT_CATEGORIES, ProductCategorySlug } from "@/lib/wigProducts";
import ShopGrid from "@/components/ShopGrid";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const { brand, shop } = await getEffectiveSiteContent();
  const products = await getWigProducts();
  const initialCategory = PRODUCT_CATEGORIES.some((c) => c.slug === searchParams.category)
    ? (searchParams.category as ProductCategorySlug)
    : undefined;

  return (
    <main className="min-h-screen bg-cream">
      <header className="px-6 pb-10 pt-16 text-center">
        <Link href="/" className="text-xs uppercase tracking-widest text-ink/50 hover:text-bronze">
          ‹ Back to {brand.name}
        </Link>
        <h1 className="mt-4 font-display text-2xl md:text-3xl">{shop.heading}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70">{shop.intro}</p>
      </header>
      <ShopGrid products={products} initialCategory={initialCategory} />
    </main>
  );
}
