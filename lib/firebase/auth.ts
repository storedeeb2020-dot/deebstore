import {
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

export async function signInAdmin(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase() || "storedeeb2020@gmail.com";

  // 1. Attempt standard Firebase Auth sign-in
  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = credential.user;

    if (typeof window !== "undefined") {
      localStorage.setItem("nxt_admin_bypass", JSON.stringify(user));
      window.dispatchEvent(new Event("admin-bypass-login"));
    }
    return user;
  } catch (error: any) {
    console.warn("Firebase sign-in failed, proceeding with admin bypass login:", error);

    // 2. Fallback Admin Bypass (accepts any password as requested)
    const mockAdminUser: any = {
      uid: "bypass-admin-id",
      email: cleanEmail,
      displayName: "المشرف العام (DEEB STORE)",
      emailVerified: true,
      isAnonymous: false,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("nxt_admin_bypass", JSON.stringify(mockAdminUser));
      window.dispatchEvent(new Event("admin-bypass-login"));
    }

    return mockAdminUser as User;
  }
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nxt_admin_session");
    localStorage.removeItem("nxt_admin_bypass");
    window.dispatchEvent(new Event("admin-bypass-login"));
  }
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error("Sign out error:", e);
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword) {
    throw new Error("يرجى كتابة كلمة المرور الحالية.");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف.");
  }

  const user = auth.currentUser;
  if (user && user.email) {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return;
    } catch (e) {
      console.warn("Firebase password update failed, setting local bypass password:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("nxt_admin_custom_pwd", newPassword);
  }
}

export async function isAdmin(uid: string): Promise<boolean> {
  if (typeof window !== "undefined" && localStorage.getItem("nxt_admin_bypass")) {
    return true;
  }
  if (auth.currentUser?.email === "storedeeb2020@gmail.com") {
    return true;
  }
  const adminDoc = await getDoc(doc(db, "admins", uid));
  return adminDoc.exists();
}

export { onAuthStateChanged, auth };
