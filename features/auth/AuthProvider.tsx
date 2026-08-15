"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkBypassUser = (): User | null => {
    if (typeof window !== "undefined") {
      const bypass = localStorage.getItem("nxt_admin_bypass");
      if (bypass) {
        try {
          return JSON.parse(bypass) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    // Listen to standard Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
      } else {
        const bypassUser = checkBypassUser();
        setUser(bypassUser);
        // Proactively sign in anonymously in background so Firestore security rules never reject requests
        signInAnonymously(auth).catch(() => {});
      }
      setLoading(false);
    });

    const handleStorageChange = () => {
      if (!auth.currentUser) {
        setUser(checkBypassUser());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("admin-bypass-login", handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("admin-bypass-login", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
