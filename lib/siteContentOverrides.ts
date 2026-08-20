import { getAdminDb } from "./firebaseAdmin";
import { siteContent as defaultContent } from "./content";
import { SiteContent, SiteContentOverrides } from "./types";

export async function getSiteContentOverrides(): Promise<SiteContentOverrides> {
  try {
    const doc = await getAdminDb().collection("siteConfig").doc("overrides").get();
    return (doc.data() as SiteContentOverrides | undefined) ?? {};
  } catch (error) {
    console.error("Failed to read site content overrides from Firestore:", error);
    return {};
  }
}

// Array overrides only apply when their length matches the default array —
// the admin form always submits full rows (never adds/removes a policy card
// etc.), so a length mismatch means stale/corrupt data and we fall back to
// the shipped defaults rather than risk an out-of-bounds render.
export function mergeSiteContent(overrides: SiteContentOverrides): SiteContent {
  return {
    ...defaultContent,
    brand: { ...defaultContent.brand, ...overrides.brand },
    stylist: { ...defaultContent.stylist, ...overrides.stylist },
    hours: overrides.hours?.length === defaultContent.hours.length ? overrides.hours : defaultContent.hours,
    contact:
      overrides.contact?.length === defaultContent.contact.length
        ? defaultContent.contact.map((c, i) => ({ ...c, label: overrides.contact![i].label }))
        : defaultContent.contact,
    policies:
      overrides.policies?.length === defaultContent.policies.length
        ? defaultContent.policies.map((p, i) => ({ ...p, ...overrides.policies![i] }))
        : defaultContent.policies,
    purchaseGuide:
      overrides.purchaseGuide?.length === defaultContent.purchaseGuide.length
        ? overrides.purchaseGuide
        : defaultContent.purchaseGuide,
    services:
      overrides.services?.length === defaultContent.services.length
        ? defaultContent.services.map((s, i) => ({ ...s, ...overrides.services![i] }))
        : defaultContent.services,
  };
}

export async function getEffectiveSiteContent(): Promise<SiteContent> {
  const overrides = await getSiteContentOverrides();
  return mergeSiteContent(overrides);
}
