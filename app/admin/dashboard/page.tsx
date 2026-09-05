import LogoutButton from "@/components/admin/LogoutButton";
import BlockOutCalendar from "@/components/admin/BlockOutCalendar";
import PriceEditor from "@/components/admin/PriceEditor";
import SlotsEditor from "@/components/admin/SlotsEditor";
import DateSlotsEditor from "@/components/admin/DateSlotsEditor";
import ContentEditor from "@/components/admin/ContentEditor";
import ImageManager from "@/components/admin/ImageManager";
import WigShopEditor from "@/components/admin/WigShopEditor";
import OrdersList from "@/components/admin/OrdersList";
import AddOnsEditor from "@/components/admin/AddOnsEditor";
import { siteContent } from "@/lib/content";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Admin dashboard</h1>
        <LogoutButton />
      </div>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-ink/60">
        Block out dates you're not taking bookings on — they'll show as
        unavailable on the public calendar.
      </p>

      <div className="mx-auto mt-8 max-w-2xl">
        <BlockOutCalendar />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Set the default times of day customers can book, on any open day.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <SlotsEditor />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Need different times on a specific day? Set custom times just for
        that date here — it overrides the default above.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <DateSlotsEditor />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Set the price for each service — customers pay this full amount online
        when they book. A service with no price set can't be booked online yet.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <PriceEditor categories={siteContent.categories} />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Optional extras for each service — customers can tick these to add
        them (and their price) to their booking.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <AddOnsEditor categories={siteContent.categories} />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Edit the text shown across the site — bio, hours, contact info, policies, and service descriptions.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <ContentEditor />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Manage photos — your profile picture, each service's image, and the gallery.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <ImageManager />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Hair Shop — Wigs, Bundles, and Lace Services tabs, add or remove as
        many products as you like in each, with photo, description, and
        length/texture/lace variants each priced individually.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <WigShopEditor />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-sm text-ink/60">
        Wig orders — most recent 50, with shipping address for fulfillment.
      </p>
      <div className="mx-auto mt-4 max-w-2xl">
        <OrdersList />
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-xs text-ink/40">
        The bookings list lands here once payments (Phase 4+) are wired up.
      </p>
    </main>
  );
}
