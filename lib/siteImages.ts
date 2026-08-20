import { getAdminDb } from "./firebaseAdmin";
import { getPublicImages } from "./images";
import { siteContent } from "./content";

export type GalleryImageEntry = {
  id: string;
  url: string;
  caption: string;
  rating: number;
  detail: string;
};

// Falls back to the shipped /public/gallery photos + their hardcoded
// captions until the admin uploads their own via the image manager — so a
// fresh deploy looks identical to before this feature existed.
function defaultGalleryEntries(): GalleryImageEntry[] {
  return getPublicImages("gallery").map((url) => {
    const id = url.split("/").pop() ?? url;
    const review = siteContent.galleryReviews[id];
    return {
      id,
      url,
      caption: review?.caption ?? "",
      rating: review?.rating ?? 5,
      detail: review?.detail ?? "",
    };
  });
}

export async function getGalleryEntries(): Promise<GalleryImageEntry[]> {
  try {
    const doc = await getAdminDb().collection("siteConfig").doc("images").get();
    const items = (doc.data() as { gallery?: GalleryImageEntry[] } | undefined)?.gallery;
    return Array.isArray(items) && items.length > 0 ? items : defaultGalleryEntries();
  } catch (error) {
    console.error("Failed to read gallery images from Firestore:", error);
    return defaultGalleryEntries();
  }
}

// Keyed by categorySlug — falls back to the default /public/services image
// at the same index as siteContent.categories until the admin replaces it.
export async function getServiceImages(): Promise<string[]> {
  const defaults = getPublicImages("services");
  try {
    const doc = await getAdminDb().collection("siteConfig").doc("images").get();
    const overrides = (doc.data() as { services?: Record<string, string> } | undefined)?.services ?? {};
    return siteContent.categories.map((c, i) => overrides[c.slug] ?? defaults[i] ?? "");
  } catch (error) {
    console.error("Failed to read service images from Firestore:", error);
    return siteContent.categories.map((_, i) => defaults[i] ?? "");
  }
}

export async function getStylistAvatarOverride(): Promise<string | null> {
  try {
    const doc = await getAdminDb().collection("siteConfig").doc("images").get();
    const avatar = (doc.data() as { stylistAvatar?: string } | undefined)?.stylistAvatar;
    return avatar ?? null;
  } catch (error) {
    console.error("Failed to read stylist avatar from Firestore:", error);
    return null;
  }
}
