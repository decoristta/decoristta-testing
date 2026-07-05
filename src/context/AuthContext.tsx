"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile, setSession, clearSession } from "@/app/actions/auth";

interface UserProfile {
  name?: string;
  displayName?: string;
  phone?: string;
  email?: string;
  role?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Failsafe: if Firebase Auth takes more than 3 seconds to initialize, force loading to false
    // This happens frequently in Incognito mode where third-party cookies/IndexedDB are blocked
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimer);
      
      // If we detect an auth change (like a login), instantly flag as loading
      // so the UI knows we are fetching the Postgres profile and doesn't blink!
      setLoading(true); 
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Set secure server session cookie for middleware
        await setSession(firebaseUser.uid);
        
        // Fetch profile from Postgres via Server Action
        const res = await getUserProfile(firebaseUser.uid);
        if (res.success && res.profile) {
          setProfile(res.profile as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      } else {
        // Clear secure server session cookie
        await clearSession();
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
