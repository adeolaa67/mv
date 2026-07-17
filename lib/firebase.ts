import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ponytail: Analytics dropped from this module — it requires `window` and
// would crash the Firestore read in lib/availability.ts, which runs on the
// server. Add it separately in a client component if you need it.
const firebaseConfig = {
  apiKey: "AIzaSyDc2KA86s_aHe1djj3wENvL__XBWHpGU7I",
  authDomain: "adeola-s-hair.firebaseapp.com",
  projectId: "adeola-s-hair",
  storageBucket: "adeola-s-hair.firebasestorage.app",
  messagingSenderId: "798185630249",
  appId: "1:798185630249:web:a4ef2f0538920a6fca8a38",
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db = getFirestore(app);
