import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server-only: the Admin SDK uses a service account with full read/write
// access, so this module must never be imported from a client component.
// Lazily initialized (not at module load) so a missing/incomplete service
// account only breaks the specific admin route that needs it, rather than
// crashing the whole server on startup.
function getAdminApp() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Service account private keys are stored with literal "\n" sequences in
  // env vars — they need converting back to real newlines to parse as PEM.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing — set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local " +
        "(from the service account JSON in Firebase console > Project settings > Service accounts)."
    );
  }

  return getApps().length
    ? getApps()[0]!
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
