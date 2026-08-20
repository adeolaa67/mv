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
