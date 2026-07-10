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
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCurrentUser();
      setUser(res.success && res.user ? (res.user as UserProfile) : null);
    } catch (error) {
      console.error("Failed to load auth state:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // First-time visitor pop-up logic
  useEffect(() => {
    if (!loading && !user) {
      const hasSeenModal = localStorage.getItem("hasSeenAuthModal");
      if (!hasSeenModal) {
        // Slight delay for better UX
        const timer = setTimeout(() => {
          setIsAuthModalOpen(true);
          localStorage.setItem("hasSeenAuthModal", "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
