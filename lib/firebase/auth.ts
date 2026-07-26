import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export async function signInAdmin(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    
    // Grant instant admin status to the primary administrator email
    if (credential.user.email?.toLowerCase() === "storedeeb2020@gmail.com") {
      return credential.user;
    }

    // Check if user is in admins collection
    const adminDoc = await getDoc(doc(db, "admins", credential.user.uid));
    if (!adminDoc.exists()) {
      await firebaseSignOut(auth);
      throw new Error("Access denied. Not an admin account.");
    }
    return credential.user;
  } catch (error: any) {
    // If primary admin email and sign in failed because user account doesn't exist yet in Firebase Auth
    if (
      cleanEmail === "storedeeb2020@gmail.com" &&
      (error?.code === "auth/invalid-credential" ||
       error?.code === "auth/user-not-found" ||
       error?.code === "auth/invalid-email")
    ) {
      try {
        // Automatically create the primary admin account
        const newCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        
        // Save to admins collection in Firestore
        await setDoc(
          doc(db, "admins", newCredential.user.uid),
          {
            email: cleanEmail,
            role: "super_admin",
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        return newCredential.user;
      } catch (createErr: any) {
        if (createErr?.code === "auth/email-already-in-use") {
          throw new Error("كلمة المرور غير صحيحة.");
        }
        if (createErr?.code === "auth/operation-not-allowed") {
          throw new Error("طريقة الدخول بـ Email/Password غير مفعّلة في Firebase Console.");
        }
        throw createErr;
      }
    }
    throw error;
  }
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nxt_admin_session");
  }
  await firebaseSignOut(auth);
}

export async function isAdmin(uid: string): Promise<boolean> {
  // If the user's email matches the primary admin email
  if (auth.currentUser?.email === "storedeeb2020@gmail.com") {
    return true;
  }
  const adminDoc = await getDoc(doc(db, "admins", uid));
  return adminDoc.exists();
}

export { onAuthStateChanged, auth };
