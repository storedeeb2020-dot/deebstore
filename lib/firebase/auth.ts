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
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
  }

  // Strictly authenticate via Firebase Auth API using real credentials (NO BYPASS FALLBACK)
  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return credential.user;
  } catch (error: any) {
    console.error("Firebase Auth sign-in failed:", error);
    let errorMsg = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      errorMsg = "بيانات الاعتماد غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور المسجلة في الفايربيس.";
    } else if (error.code === "auth/too-many-requests") {
      errorMsg = "تم حظر محاولات الدخول الفاشلة مؤقتاً بكثرة المحاولات. يرجى المحاولة لاحقاً.";
    }
    throw new Error(errorMsg);
  }
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nxt_admin_session");
    localStorage.removeItem("nxt_admin_bypass");
  }
  await firebaseSignOut(auth);
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword) {
    throw new Error("يرجى كتابة كلمة المرور الحالية.");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف.");
  }

  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("لم يتم العثور على جلسة مستخدم نشطة في الفايربيس.");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function isAdmin(uid: string): Promise<boolean> {
  if (auth.currentUser?.email === "storedeeb2020@gmail.com") {
    return true;
  }
  if (!uid) return false;
  try {
    const adminDoc = await getDoc(doc(db, "admins", uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export { onAuthStateChanged, auth };
