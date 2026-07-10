"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getCurrentUser } from "@/app/actions/auth";

interface UserProfile {
  id: string;
  phone: string;
  email: string | null;
  displayName: string | null;
  marketingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // There's no realtime auth-state listener anymore (that was a Firebase SDK
  // feature) -- instead, callers explicitly call refresh() right after sign-in
  // or sign-out completes, so the session cookie is guaranteed to already be
  // set/cleared by the time this re-fetches.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCurrentUser();
      setUser(res.success && res.user ? (res.user as UserProfile) : null);
    } catch (error) {
      // If the server action itself throws (e.g. a misconfigured env var
      // crashing the DB client at module load), fail closed to "signed out"
      // instead of leaving the UI stuck on a spinner forever.
      console.error("Failed to load auth state:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
