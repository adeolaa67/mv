import { getAdminDb } from "./firebaseAdmin";
import { WigProduct, WIG_PRODUCT_IDS } from "./wigProducts";

function defaultProduct(id: string): WigProduct {
  return { id, name: `Wig ${id}`, description: "", imageUrl: "", variants: [] };
}

export async function getWigProducts(): Promise<WigProduct[]> {
  try {
    const snapshot = await getAdminDb().collection("wigProducts").get();
    const byId = new Map(snapshot.docs.map((doc) => [doc.id, doc.data() as Omit<WigProduct, "id">]));
    return WIG_PRODUCT_IDS.map((id) => {
      const data = byId.get(id);
      return data ? { id, ...data } : defaultProduct(id);
    });
  } catch (error) {
    console.error("Failed to read wig products from Firestore:", error);
    return WIG_PRODUCT_IDS.map(defaultProduct);
  }
}

export async function getWigProduct(id: string): Promise<WigProduct | null> {
  if (!WIG_PRODUCT_IDS.includes(id)) return null;
  try {
    const doc = await getAdminDb().collection("wigProducts").doc(id).get();
    const data = doc.data() as Omit<WigProduct, "id"> | undefined;
    return data ? { id, ...data } : defaultProduct(id);
  } catch (error) {
    console.error("Failed to read wig product from Firestore:", error);
    return defaultProduct(id);
  }
}
