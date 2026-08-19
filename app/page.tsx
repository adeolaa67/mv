import { siteContent } from "@/lib/content";
import { getGalleryImages } from "@/lib/gallery";
import { getServiceImages } from "@/lib/services";
import { getUnavailableDates, getBookedSlotsByDate } from "@/lib/availability";
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
  const { brand, stylist, hours, contact, policies, purchaseGuide, galleryReviews, services, categories } =
    siteContent;
  const galleryImages = getGalleryImages();
  const serviceImages = getServiceImages();
  const unavailableDates = await getUnavailableDates();
  const bookedSlotsByDate = await getBookedSlotsByDate();

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader name={brand.name} tagline={brand.tagline} location={brand.location} />
      <StylistIntro
        name={stylist.greetingName}
        bio={stylist.bio}
        avatarInitials={stylist.avatarInitials}
        avatarSrc={stylist.avatarSrc}
      />
      <Gallery images={galleryImages} reviews={galleryReviews} />
      <BookingPolicies policies={policies} />
      <Services services={services} categories={categories} images={serviceImages} moreHref="#calendar" />
      <HairPurchaseGuide steps={purchaseGuide} />
      <CtaBanner label="Choose your appointment below" href="#calendar" />
      <BookingCalendar
        id="calendar"
        unavailableDates={unavailableDates}
        bookedSlotsByDate={bookedSlotsByDate}
        categories={categories}
      />
      <HoursContact hours={hours} contact={contact} />
    </main>
  );
}
