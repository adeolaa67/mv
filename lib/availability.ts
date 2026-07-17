import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

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
