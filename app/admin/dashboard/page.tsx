import LogoutButton from "@/components/admin/LogoutButton";
import BlockOutCalendar from "@/components/admin/BlockOutCalendar";

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

      <p className="mx-auto mt-8 max-w-2xl text-xs text-ink/40">
        The bookings list lands here once payments (Phase 4+) are wired up.
      </p>
    </main>
  );
}
