export type HoursRow = {
  label: string;
  time: string;
};

export type ContactRow = {
  icon: "instagram" | "tiktok" | "mail" | "phone";
  label: string;
  href: string;
};

export type PolicyCard = {
  icon: "card" | "clock" | "refund" | "calendar";
  title: string;
  body: string;
};

export type PurchaseStep = {
  title: string;
  body: string;
};

export type ServiceCategory = {
  slug: string;
  name: string;
  options: string[];
};

export type GalleryReview = {
  caption: string;
  rating: number;
  detail: string;
};

export type Service = {
  name: string;
  description: string;
  care: string;
  duration: string;
  priceFrom: string;
  categorySlug: string;
};

export type SiteContent = {
  brand: {
    name: string;
    tagline: string;
    location: string;
  };
  stylist: {
    greetingName: string;
    bio: string;
    avatarInitials: string;
    avatarSrc?: string;
  };
  hours: HoursRow[];
  contact: ContactRow[];
  policies: PolicyCard[];
  purchaseGuide: PurchaseStep[];
  categories: ServiceCategory[];
  galleryReviews: Record<string, GalleryReview>;
  services: Service[];
};

// Admin-editable text overlaid on top of the lib/content.ts defaults. Arrays
// are only applied when their length matches the corresponding default array
// (edits are per-item text changes, not structural additions/removals).
export type SiteContentOverrides = {
  brand?: {
    tagline?: string;
    location?: string;
  };
  stylist?: {
    bio?: string;
  };
  hours?: HoursRow[];
  contact?: { label: string }[];
  policies?: { title: string; body: string }[];
  purchaseGuide?: PurchaseStep[];
  services?: {
    name: string;
    description: string;
    care: string;
    duration: string;
    priceFrom: string;
  }[];
};

export type BookingSlotsSettings = {
  slots: string[];
};
