"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updateProfile, User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  function requireAuth() {
    if (!auth) {
      throw new Error("Firebase is not configured. Add the Firebase web app values to apps/web/.env.local.");
    }
    return auth;
  }

  const value: AuthCtx = {
    user, loading,
    login: async (e, p) => { await signInWithEmailAndPassword(requireAuth(), e, p); },
    register: async (e, p, name) => {
      const cred = await createUserWithEmailAndPassword(requireAuth(), e, p);
      await updateProfile(cred.user, { displayName: name });
    },
    logout: async () => { await signOut(requireAuth()); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
