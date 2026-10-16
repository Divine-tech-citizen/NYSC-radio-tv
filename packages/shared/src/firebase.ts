import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export function getFirebaseApp(config: FirebaseOptions) {
  return getApps()[0] ?? initializeApp(config);
}
export const getDb = (config: FirebaseOptions) => getFirestore(getFirebaseApp(config));
export const getBucket = (config: FirebaseOptions) => getStorage(getFirebaseApp(config));
