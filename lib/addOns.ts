import { getAdminDb } from "./firebaseAdmin";

export type AddOn = { id: string; name: string; pricePence: number };

// Keyed by categorySlug — optional extras a customer can tick alongside the
// main service, each adding its own price to the checkout total.
export async function getAddOnsByCategory(): Promise<Record<string, AddOn[]>> {
  try {
    const snapshot = await getAdminDb().collection("addOns").get();
    const byCategory: Record<string, AddOn[]> = {};
    for (const doc of snapshot.docs) {
      const items = (doc.data() as { items?: AddOn[] } | undefined)?.items;
      if (Array.isArray(items) && items.length > 0) byCategory[doc.id] = items;
    }
    return byCategory;
  } catch (error) {
    console.error("Failed to read add-ons from Firestore:", error);
    return {};
  }
}
