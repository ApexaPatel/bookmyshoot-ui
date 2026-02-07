import { getFirebaseStorage, isFirebaseConfigured } from './firebase';

export { isFirebaseConfigured };

const PROFILE_IMAGES_PATH = 'profile-images';

/**
 * Upload a profile image file to Firebase Storage (CDN SDK) and return the public download URL.
 * Path: profile-images/{folder}/{timestamp}.jpg
 * @param {File} file - Image file (e.g. from input type="file")
 * @param {string} folder - Subfolder: "signup" for signup flow, or userId for profile update
 * @returns {Promise<string>} Download URL
 */
export async function uploadProfileImage(file, folder = 'signup') {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Storage is not configured. Add VITE_FIREBASE_* env variables.');
  }
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Firebase Storage failed to initialize. Ensure Firebase scripts are loaded in index.html.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z]/g, '') || 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const path = `${PROFILE_IMAGES_PATH}/${folder}/${filename}`;
  const storageRef = storage.ref(path);
  await storageRef.put(file, { contentType: file.type || 'image/jpeg' });
  const url = await storageRef.getDownloadURL();
  return url;
}
