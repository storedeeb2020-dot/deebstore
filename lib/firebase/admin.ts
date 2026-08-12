import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!admin.apps.length && projectId && clientEmail && privateKey) {
  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = {
  createSessionCookie: async (idToken: string, options: any) => {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized. Check your environment variables.");
    }
    return admin.auth().createSessionCookie(idToken, options);
  },
  verifySessionCookie: async (sessionCookie: string, checkRevoked?: boolean) => {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized. Check your environment variables.");
    }
    return admin.auth().verifySessionCookie(sessionCookie, checkRevoked);
  }
} as any;

export const adminDb = {
  collection: (collectionPath: string) => {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK is not initialized. Check your environment variables.");
    }
    return admin.firestore().collection(collectionPath);
  }
} as any;

export default admin;
