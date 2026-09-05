import { SiteContent } from "./types";

export const siteContent: SiteContent = {
  brand: {
    name: "By Adebless",
    tagline: "Hairstylist",
    location: "Dagenham",
  },
  stylist: {
    greetingName: "Adeola",
    bio: "Hello, my name is Adeola. I am a Luxury Extensions Specialist. Please ensure you read all the information provided below before booking. Thank you for choosing me to be your stylist. I can't wait to slay you!",
    avatarInitials: "A",
    avatarSrc: "/stylist/adeola.png",
  },
  hours: [
    { label: "Mon – Fri", time: "9am – 5pm" },
    { label: "Sat", time: "10am – 5pm" },
    { label: "Sun", time: "Closed" },
  ],
  contact: [
    { icon: "instagram", label: "@byadebless", href: "https://instagram.com/byadebless" },
    { icon: "tiktok", label: "@byadebless", href: "https://tiktok.com/@byadebless" },
    { icon: "mail", label: "byadebless@gmail.com", href: "mailto:byadebless@gmail.com" },
    { icon: "phone", label: "07359 323852", href: "tel:+447359323852" },
  ],
  policies: [
    {
      icon: "card",
      title: "Payment",
      body: "Full payment for your appointment is taken online by card at the time of booking.",
    },
    {
      icon: "clock",
      title: "Late Policy",
      body: "If you are running late, please let us know! We have a 15 minute grace period. After 15 minutes you will be charged a £10 late fee. After 30 minutes, your appointment will be cancelled and your payment will be forfeited.",
    },
    {
      icon: "refund",
      title: "Cancellation",
      body: "All cancellations must be made at least 48 hours in advance. Failing to do so will result in a £45 fee being applied. No shows will be charged the full price of the service and permanently prohibited from booking in the future.",
    },
    {
      icon: "calendar",
      title: "Availability",
      body: "Slots are released on the 15th of each month at 12pm. Slots booked outside of hours (before 9am & after 6pm) will incur an additional £20 fee.",
    },
  ],
  purchaseGuide: [
    {
      title: "Which do I need?",
      body: "Our Flat Weft Extensions are ideal for our Sew-Ins, whereas our Tape In Extensions are ideal for our Tape-In services.",
    },
    {
      title: "When to order?",
      body: "If you require extensions to be provided at your appointment, you must place an order at least 7 days prior.",
    },
    {
      title: "How to order",
      body: "Please send us a message via WhatsApp (+44 7359 323852) including your full name, hair required, and your appointment date/time.",
    },
  ],
  categories: [
    {
      slug: "premade-frontal-installation",
      name: "Pre-made Frontal installation",
      options: ["Pre-made Frontal installation"],
    },
    {
      slug: "premade-closure-installation",
      name: "Pre-made Closure installation",
      options: ["Pre-made Closure installation"],
    },
    {
      slug: "re-install",
      name: "Re-install",
      options: ["Re-install"],
    },
    {
      slug: "frontal-ponytail",
      name: "Frontal Ponytail",
      options: ["Frontal Ponytail"],
    },
    {
      slug: "customisation",
      name: "Customisation",
      options: ["Customisation"],
    },
  ],
  galleryReviews: {
    "01.jpg": {
      caption: "Lace melted right into my skin.",
      rating: 5,
      detail: "You genuinely could not tell it was a wig install. Adeola was so nice throughout, and the space itself was clean, comfortable, and welcoming.",
    },
    "02.jpg": {
      caption: "Still flawless 3 weeks later.",
      rating: 5,
      detail: "My wig install lasted 3+ weeks with just a couple of minor touch-ups. Adeola gave me great advice on how to maintain it properly at home.",
    },
    "03.jpg": {
      caption: "Best wig install I've had.",
      rating: 5,
      detail: "Sat comfortably for the whole appointment in such a welcoming environment. No pulling, no tension — just a completely seamless, gorgeous result.",
    },
    "04.jpg": {
      caption: "So many compliments!",
      rating: 4,
      detail: "I lost count of how many people asked where I got my hair done. Adeola is lovely to be around too — really put me at ease.",
    },
    "05.jpg": {
      caption: "Adeola never disappoints.",
      rating: 5,
      detail: "This is my fourth appointment and the quality is consistent every single time. Clean, comfortable space and genuinely helpful advice on aftercare.",
    },
    "06.jpg": {
      caption: "Undetectable lace, real confidence.",
      rating: 5,
      detail: "The lace melted onto my skin so well nobody could tell. Such a warm, welcoming atmosphere — I always leave with so many compliments.",
    },
  },
  services: [
    {
      name: "Pre-made Frontal Installation",
      description: "A pre-made frontal, custom fitted and blended to your hairline.",
      care: "Frontal is fitted, blended, and styled with edge control for a natural, ear-to-ear finish.",
      duration: "Please enquire",
      priceFrom: "Please enquire",
      categorySlug: "premade-frontal-installation",
    },
    {
      name: "Pre-made Closure Installation",
      description: "A pre-made closure, fitted for a natural, low-maintenance part.",
      care: "Closure is fitted and blended for a seamless, undetectable parting.",
      duration: "Please enquire",
      priceFrom: "Please enquire",
      categorySlug: "premade-closure-installation",
    },
    {
      name: "Re-install",
      description: "Refresh an existing install — removed, hair cared for, and reseated.",
      care: "Existing unit is removed, natural hair underneath is cleansed and conditioned, and the unit is reinstalled.",
      duration: "Please enquire",
      priceFrom: "Please enquire",
      categorySlug: "re-install",
    },
    {
      name: "Frontal Ponytail",
      description: "A sleek ponytail install using a frontal for a natural hairline.",
      care: "Frontal is laid and blended before the ponytail is secured and styled.",
      duration: "Please enquire",
      priceFrom: "Please enquire",
      categorySlug: "frontal-ponytail",
    },
    {
      name: "Customisation",
      description: "Bespoke customisation of your unit to your exact spec.",
      care: "Unit is customised — plucked, bleached, tinted, or styled to your preference.",
      duration: "Please enquire",
      priceFrom: "Please enquire",
      categorySlug: "customisation",
    },
  ],
  shop: {
    heading: "Shop Our Hair",
    intro: "Browse Wigs, Bundles, and Lace Services below — pick a length, texture, and lace type, then checkout securely.",
  },
};
