// src/lib/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNsh0tY3xK6fTozhuaavmSZhHJEMFsNgg",
  authDomain: "fitness-tracker-e007b.firebaseapp.com",
  projectId: "fitness-tracker-e007b",
  storageBucket: "fitness-tracker-e007b.appspot.com", // ✅ fix
  messagingSenderId: "406772393717",
  appId: "1:406772393717:web:1456a1b8233f3f1ebf47bc",
  measurementId: "G-XSXDKWZN71",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Either initialize with local cache (good)…
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// …or, if you prefer the default without caching, use:
// export const db = getFirestore(app);
