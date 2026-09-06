import { randomUUID } from "crypto";
import { getAdminDb } from "./firebaseAdmin";
import { WigProduct, ProductCategorySlug } from "./wigProducts";

// Firestore's doc.data() can include a Timestamp (updatedAt) — a class
// instance, not a plain object, which Next.js refuses to pass from a server
// component to a client component. Pick only the plain fields WigProduct
// actually needs instead of spreading the raw doc data.
function toProduct(id: string, data: Record<string, unknown> | undefined): WigProduct | null {
  if (!data) return null;
  const category: ProductCategorySlug =
    data.category === "bundles" || data.category === "lace-services" ? data.category : "wigs";
  return {
    id,
    category,
    name: typeof data.name === "string" ? data.name : "",
    description: typeof data.description === "string" ? data.description : "",
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    variants: Array.isArray(data.variants) ? data.variants : [],
    textures: Array.isArray(data.textures) ? data.textures : [],
  };
}

export async function getWigProducts(): Promise<WigProduct[]> {
  try {
    const snapshot = await getAdminDb().collection("wigProducts").get();
    return snapshot.docs
      .map((doc) => toProduct(doc.id, doc.data()))
      .filter((p): p is WigProduct => p !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Failed to read wig products from Firestore:", error);
    return [];
  }
}

export async function getWigProduct(id: string): Promise<WigProduct | null> {
  try {
    const doc = await getAdminDb().collection("wigProducts").doc(id).get();
    return toProduct(doc.id, doc.data());
  } catch (error) {
    console.error("Failed to read wig product from Firestore:", error);
    return null;
  }
}

export async function createWigProduct(category: ProductCategorySlug): Promise<WigProduct> {
  const id = randomUUID();
  const product: WigProduct = { id, category, name: "", description: "", imageUrl: "", variants: [], textures: [] };
  await getAdminDb()
    .collection("wigProducts")
    .doc(id)
    .set({ category, name: "", description: "", imageUrl: "", variants: [], textures: [], updatedAt: new Date() });
  return product;
}

export async function deleteWigProduct(id: string): Promise<void> {
  await getAdminDb().collection("wigProducts").doc(id).delete();
}
