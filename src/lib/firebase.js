const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let storage = null;

export const isFirebaseConfigured = () => !!(firebaseConfig.apiKey && firebaseConfig.storageBucket);

/** Get Firebase Storage instance (uses global firebase from CDN scripts in index.html). */
export function getFirebaseStorage() {
  if (storage) return storage;
  if (!isFirebaseConfigured()) return null;
  try {
    const firebase = window.firebase;
    if (!firebase?.storage) return null;
    app = app || firebase.apps[0] || firebase.initializeApp(firebaseConfig);
    storage = firebase.storage(app);
    return storage;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    return null;
  }
}

export { app, storage };
