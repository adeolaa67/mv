import { getAdminDb } from "./firebaseAdmin";
import { WigProduct, WIG_PRODUCT_IDS } from "./wigProducts";

function defaultProduct(id: string): WigProduct {
  return { id, name: `Wig ${id}`, description: "", imageUrl: "", variants: [] };
}

// Firestore's doc.data() can include a Timestamp (updatedAt) — a class
// instance, not a plain object, which Next.js refuses to pass from a server
// component to a client component. Pick only the plain fields WigProduct
// actually needs instead of spreading the raw doc data.
function toProduct(id: string, data: Record<string, unknown> | undefined): WigProduct {
  if (!data) return defaultProduct(id);
  return {
    id,
    name: typeof data.name === "string" ? data.name : `Wig ${id}`,
    description: typeof data.description === "string" ? data.description : "",
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    variants: Array.isArray(data.variants) ? data.variants : [],
  };
}

export async function getWigProducts(): Promise<WigProduct[]> {
  try {
    const snapshot = await getAdminDb().collection("wigProducts").get();
    const byId = new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]));
    return WIG_PRODUCT_IDS.map((id) => toProduct(id, byId.get(id)));
  } catch (error) {
    console.error("Failed to read wig products from Firestore:", error);
    return WIG_PRODUCT_IDS.map(defaultProduct);
  }
}

export async function getWigProduct(id: string): Promise<WigProduct | null> {
  if (!WIG_PRODUCT_IDS.includes(id)) return null;
  try {
    const doc = await getAdminDb().collection("wigProducts").doc(id).get();
    return toProduct(id, doc.data());
  } catch (error) {
    console.error("Failed to read wig product from Firestore:", error);
    return defaultProduct(id);
  }
}
