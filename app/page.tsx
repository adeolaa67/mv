import { getEffectiveSiteContent } from "@/lib/siteContentOverrides";
import { getGalleryEntries, getServiceImages, getStylistAvatarOverride } from "@/lib/siteImages";
import { getUnavailableDates, getBookedSlotsByDate } from "@/lib/availability";
import { getServicePrices } from "@/lib/prices";
import { getBookingSlots } from "@/lib/slots";
import SiteHeader from "@/components/SiteHeader";
import StylistIntro from "@/components/StylistIntro";
import Gallery from "@/components/Gallery";
import HoursContact from "@/components/HoursContact";
import BookingPolicies from "@/components/BookingPolicies";
import Services from "@/components/Services";
import HairPurchaseGuide from "@/components/HairPurchaseGuide";
import CtaBanner from "@/components/CtaBanner";
import BookingCalendar from "@/components/BookingCalendar";

// Blocked dates come from Firestore and can change at any time (admin
// blocking a date), so this page can't be statically prerendered.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { brand, stylist, hours, contact, policies, purchaseGuide, services, categories } =
    await getEffectiveSiteContent();
  const galleryEntries = await getGalleryEntries();
  const galleryImages = galleryEntries.map((e) => e.url);
  const galleryReviews = Object.fromEntries(
    galleryEntries.map((e) => [e.url.split("/").pop() ?? e.id, { caption: e.caption, rating: e.rating, detail: e.detail }]),
  );
  const serviceImages = await getServiceImages();
  const stylistAvatarOverride = await getStylistAvatarOverride();
  const unavailableDates = await getUnavailableDates();
  const bookedSlotsByDate = await getBookedSlotsByDate();
  const pricesPence = await getServicePrices();
  const slots = await getBookingSlots();

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader name={brand.name} tagline={brand.tagline} location={brand.location} />
      <StylistIntro
        name={stylist.greetingName}
        bio={stylist.bio}
        avatarInitials={stylist.avatarInitials}
        avatarSrc={stylistAvatarOverride ?? stylist.avatarSrc}
      />
      <Gallery images={galleryImages} reviews={galleryReviews} />
      <BookingPolicies policies={policies} />
      <Services
        services={services}
        categories={categories}
        images={serviceImages}
        moreHref="#calendar"
        pricesPence={pricesPence}
      />
      <HairPurchaseGuide steps={purchaseGuide} />
      <CtaBanner label="Choose your appointment below" href="#calendar" />
      <BookingCalendar
        id="calendar"
        unavailableDates={unavailableDates}
        bookedSlotsByDate={bookedSlotsByDate}
        categories={categories}
        pricesPence={pricesPence}
        slots={slots}
      />
      <HoursContact hours={hours} contact={contact} />
    </main>
  );
}
