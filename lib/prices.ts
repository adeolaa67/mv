import { getAdminDb } from "./firebaseAdmin";

// Admin-set full price per category, in pence (Stripe's unit). Doc ID is the
// categorySlug. A category with no doc (or pricePence <= 0) has no price set
// yet — checkout refuses to book it until the admin sets one.
export async function getServicePrices(): Promise<Record<string, number>> {
  try {
    const snapshot = await getAdminDb().collection("servicePrices").get();
    const prices: Record<string, number> = {};
    for (const doc of snapshot.docs) {
      const { pricePence } = doc.data() as { pricePence?: number };
      if (typeof pricePence === "number" && pricePence > 0) {
        prices[doc.id] = pricePence;
      }
    }
    return prices;
  } catch (error) {
    console.error("Failed to read servicePrices from Firestore:", error);
    return {};
  }
}
