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
      caption: "Flawless finish, so natural!",
      rating: 5,
      detail: "I've had extensions done before but never this seamless. Adeola matched the texture perfectly and the install didn't feel heavy at all. Booking again next month.",
    },
    "02.jpg": {
      caption: "Obsessed with this install.",
      rating: 5,
      detail: "From consultation to finish Adeola talked me through every step. The parting looks completely natural and it's held up beautifully two weeks on.",
    },
    "03.jpg": {
      caption: "Best sew-in I've had.",
      rating: 5,
      detail: "Sat comfortably for the whole appointment and left with the neatest sew-in I've ever had. No pulling, no tension headaches — just a gorgeous result.",
    },
    "04.jpg": {
      caption: "Quick, neat, and beautiful.",
      rating: 4,
      detail: "Was in and out faster than expected without the finish feeling rushed. Only reason it's not five stars is I wish I'd booked a longer length!",
    },
    "05.jpg": {
      caption: "Adeola never disappoints.",
      rating: 5,
      detail: "This is my fourth appointment and the quality is consistent every single time. Clean workspace, great communication, stunning results.",
    },
    "06.jpg": {
      caption: "Perfect for the occasion.",
      rating: 5,
      detail: "Needed something special for a wedding and Adeola delivered exactly what I pictured. Got compliments all night — thank you!",
    },
  },
  services: [
    {
      name: "Full Sew-In",
      description: "Complete weave install with leave-out or closure.",
      care: "Natural hair is washed, conditioned, and cornrowed into a protective base before wefts are hand-sewn in with careful, low-tension stitching.",
      duration: "2.5 – 3 hrs",
      priceFrom: "£120",
      categorySlug: "sew-ins",
    },
    {
      name: "Closure Sew-In",
      description: "Sew-in finished with a lace closure for a natural part.",
      care: "Braided base as standard, with the closure bleached, plucked, and tinted to match your scalp for an undetectable parting.",
      duration: "3 hrs",
      priceFrom: "£150",
      categorySlug: "sew-ins",
    },
    {
      name: "Frontal Sew-In",
      description: "Sew-in finished with a lace frontal, ear to ear.",
      care: "Frontal is custom cut, tinted, and laid with edge control for a seamless ear-to-ear hairline that can be styled away from the face.",
      duration: "3.5 hrs",
      priceFrom: "£180",
      categorySlug: "sew-ins",
    },
    {
      name: "Partial Sew-In",
      description: "A lighter install blending with your own leave-out.",
      care: "A lighter braided base leaves more of your natural hair out to blend, giving a fuller look with less tension on the scalp.",
      duration: "2 hrs",
      priceFrom: "£100",
      categorySlug: "sew-ins",
    },
    {
      name: "Full Head Tape-In",
      description: "Seamless tape-in extensions through the whole head.",
      care: "Wefts are sectioned and taped close to the root in thin, even panels so they lie flat and move naturally with your hair.",
      duration: "2 hrs",
      priceFrom: "£160",
      categorySlug: "tape-ins",
    },
    {
      name: "Half Head Tape-In",
      description: "Tape-in extensions for added length and volume on top.",
      care: "Focused placement through the crown and mid-lengths adds volume and length without the cost or upkeep of a full head.",
      duration: "1.5 hrs",
      priceFrom: "£110",
      categorySlug: "tape-ins",
    },
    {
      name: "Tape-In Refresh",
      description: "Move-up and reseal for existing tape-in extensions.",
      care: "Existing tapes are removed, hair is cleansed of residue, and wefts are moved up and resealed at the root.",
      duration: "1.5 hrs",
      priceFrom: "£70",
      categorySlug: "tape-ins",
    },
    {
      name: "Closure Hybrid",
      description: "Sew-in and tape-in combined, finished with a closure.",
      care: "Combines a braided sew-in base with taped panels for extra volume, finished with a blended, natural-parting closure.",
      duration: "3 hrs",
      priceFrom: "£170",
      categorySlug: "hybrid-installations",
    },
  ],
};
