import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { getAdminDb } from "./firebaseAdmin";

// ponytail: assumes a "blockedDates" collection where each document's ID is
// an ISO yyyy-mm-dd date and its existence means the date is blocked. Matches
// the planned admin flow (block out dates you don't want) — adjust the
// collection/field names here if the admin side ends up shaped differently.
export async function getUnavailableDates(): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, "blockedDates"));
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    // A misconfigured Firestore project (rules, missing collection, etc.)
    // shouldn't take the whole booking page down — fall back to "nothing
    // blocked" and log so it's visible in the server console.
    console.error("Failed to read blockedDates from Firestore:", error);
    return [];
  }
}

// `bookings` denies public client reads (server-only via Admin SDK, per the
// security rules sketch in BUILD-PLAN.md), so this has to run server-side —
// callers must be a server component or API route, never a client component.
// Only "confirmed" bookings hold a slot; cancelled ones free it back up.
export async function getBookedSlotsByDate(): Promise<Record<string, string[]>> {
  try {
    const snapshot = await getAdminDb()
      .collection("bookings")
      .where("status", "==", "confirmed")
      .get();

    const byDate: Record<string, string[]> = {};
    for (const doc of snapshot.docs) {
      const { date, slot } = doc.data() as { date?: string; slot?: string };
      if (!date || !slot) continue;
      (byDate[date] ??= []).push(slot);
    }
    return byDate;
  } catch (error) {
    // Same fallback philosophy as getUnavailableDates: missing credentials or
    // an empty/nonexistent collection shouldn't take the booking page down.
    console.error("Failed to read bookings from Firestore:", error);
    return {};
  }
}
