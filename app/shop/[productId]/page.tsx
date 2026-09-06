import Link from "next/link";
import { notFound } from "next/navigation";
import { getEffectiveSiteContent } from "@/lib/siteContentOverrides";
import { getWigProduct } from "@/lib/wigProductsServer";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { productId: string } }) {
  const { brand } = await getEffectiveSiteContent();
  const product = await getWigProduct(params.productId);

  if (!product || !product.imageUrl) notFound();

  return (
    <main className="min-h-screen bg-cream">
      <header className="px-6 pb-8 pt-12">
        <Link href="/shop" className="text-xs uppercase tracking-widest text-ink/50 hover:text-bronze">
          ‹ Back to {brand.name} Shop
        </Link>
      </header>
      <ProductDetail product={product} />
    </main>
  );
}
