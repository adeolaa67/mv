export type ProductCategorySlug = "wigs" | "bundles" | "lace-services";

// Order here drives tab order on the shop page and category order in the
// admin editor.
export const PRODUCT_CATEGORIES: { slug: ProductCategorySlug; label: string }[] = [
  { slug: "wigs", label: "Wigs" },
  { slug: "bundles", label: "Bundles" },
  { slug: "lace-services", label: "Lace Services" },
];

export type WigVariant = { id: string; length: string; texture: string; lace: string; pricePence: number };
export type WigProduct = {
  id: string;
  category: ProductCategorySlug;
  name: string;
  description: string;
  imageUrl: string;
  variants: WigVariant[];
};

export function minPricePence(product: WigProduct): number | null {
  if (product.variants.length === 0) return null;
  return Math.min(...product.variants.map((v) => v.pricePence));
}
