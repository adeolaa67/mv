import { getAdminDb } from "./firebaseAdmin";

// Used only as a fallback until the admin sets custom slots in Firestore.
export const DEFAULT_SLOTS = ["9:00am", "10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm"];

// Shared between BookingCalendar (UI) and /api/checkout (server-side
// validation) so the two can't silently drift out of sync — both call this
// instead of importing a static list.
export async function getBookingSlots(): Promise<string[]> {
  try {
    const doc = await getAdminDb().collection("settings").doc("booking").get();
    const slots = (doc.data() as { slots?: string[] } | undefined)?.slots;
    return Array.isArray(slots) && slots.length > 0 ? slots : DEFAULT_SLOTS;
  } catch (error) {
    console.error("Failed to read booking slots from Firestore:", error);
    return DEFAULT_SLOTS;
  }
}

// Per-date overrides, doc ID = yyyy-mm-dd — lets the admin set different
// times for an individual day instead of the site-wide default from
// getBookingSlots(). A date with no doc (or an empty slots array) just uses
// the default.
export async function getDateSlotOverride(date: string): Promise<string[] | null> {
  try {
    const doc = await getAdminDb().collection("dateSlots").doc(date).get();
    const slots = (doc.data() as { slots?: string[] } | undefined)?.slots;
    return Array.isArray(slots) && slots.length > 0 ? slots : null;
  } catch (error) {
    console.error("Failed to read date slot override from Firestore:", error);
    return null;
  }
}

export async function getAllDateSlotOverrides(): Promise<Record<string, string[]>> {
  try {
    const snapshot = await getAdminDb().collection("dateSlots").get();
    const overrides: Record<string, string[]> = {};
    for (const doc of snapshot.docs) {
      const slots = (doc.data() as { slots?: string[] } | undefined)?.slots;
      if (Array.isArray(slots) && slots.length > 0) overrides[doc.id] = slots;
    }
    return overrides;
  } catch (error) {
    console.error("Failed to read date slot overrides from Firestore:", error);
    return {};
  }
}

// The date's own slots if it has an override, otherwise the site-wide
// default — used by /api/checkout to validate a booking's requested slot.
export async function getEffectiveSlotsForDate(date: string): Promise<string[]> {
  const override = await getDateSlotOverride(date);
  return override ?? getBookingSlots();
}
