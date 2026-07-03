import { siteContent } from "@/lib/content";
import SiteHeader from "@/components/SiteHeader";
import StylistIntro from "@/components/StylistIntro";
import HoursContact from "@/components/HoursContact";
import BookingPolicies from "@/components/BookingPolicies";
import HairPurchaseGuide from "@/components/HairPurchaseGuide";
import CtaBanner from "@/components/CtaBanner";
import CategorySelector from "@/components/CategorySelector";

export default function Home() {
  const { brand, stylist, hours, contact, policies, purchaseGuide, categories } = siteContent;

  return (
    <main className="min-h-screen bg-cream">
      <SiteHeader name={brand.name} tagline={brand.tagline} location={brand.location} />
      <StylistIntro
        name={stylist.greetingName}
        bio={stylist.bio}
        avatarInitials={stylist.avatarInitials}
      />
      <HoursContact hours={hours} contact={contact} />
      <BookingPolicies policies={policies} />
      <HairPurchaseGuide steps={purchaseGuide} />
      <CtaBanner label="Choose your appointment below" href="#categories" />
      <CategorySelector id="categories" categories={categories} />
    </main>
  );
}
