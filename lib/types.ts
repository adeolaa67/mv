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
  };
  hours: HoursRow[];
  contact: ContactRow[];
  policies: PolicyCard[];
  purchaseGuide: PurchaseStep[];
  categories: ServiceCategory[];
};
