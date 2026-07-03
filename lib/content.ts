import { SiteContent } from "./types";

export const siteContent: SiteContent = {
  brand: {
    name: "By Ade Bless",
    tagline: "Hairstylist",
    location: "Selly Oak, Dagenham",
  },
  stylist: {
    greetingName: "Adeola",
    bio: "Hello, my name is Adeola. I am a Luxury Extensions Specialist. Please ensure you read all the information provided below before booking. Thank you for choosing me to be your stylist. I can't wait to slay you!",
    avatarInitials: "A",
  },
  hours: [
    { label: "Mon – Fri", time: "9am – 5pm" },
    { label: "Sat", time: "10am – 5pm" },
    { label: "Sun", time: "Closed" },
  ],
  contact: [
    { icon: "instagram", label: "@mvhairuk", href: "https://instagram.com/mvhairuk" },
    { icon: "tiktok", label: "@mvhairuk", href: "https://tiktok.com/@mvhairuk" },
    { icon: "mail", label: "mvhairuk@gmail.com", href: "mailto:mvhairuk@gmail.com" },
    { icon: "phone", label: "07359 323852", href: "tel:+447359323852" },
  ],
  policies: [
    {
      icon: "card",
      title: "Payment",
      body: "All appointments require a £20 non-refundable deposit. The remainder must be paid via cash or bank transfer on the day of your appointment.",
    },
    {
      icon: "clock",
      title: "Late Policy",
      body: "If you are running late, please let us know! We have a 15 minute grace period. After 15 minutes you will be charged a £10 late fee. After 30 minutes, your appointment will be cancelled and your deposit will be forfeited.",
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
    { slug: "hair-provided-packages", name: "Hair Provided Packages" },
    { slug: "hybrid-installations", name: "Hybrid Installations" },
    { slug: "sew-ins", name: "Sew Ins" },
    { slug: "tape-ins", name: "Tape-Ins" },
  ],
};
