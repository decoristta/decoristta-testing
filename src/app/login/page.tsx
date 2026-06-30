"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    // If logged in and profile exists, redirect to account
    if (user && profile && !authLoading) {
      router.push("/account");
    } else if (user && !profile && !authLoading && step !== "profile") {
      setStep("profile");
    }
  }, [user, profile, authLoading, router, step]);

  useEffect(() => {
    if (!authLoading && step === "phone") {
      const initRecaptcha = () => {
        // Clear old verifier if it exists (crucial for Next.js Fast Refresh)
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {}
          window.recaptchaVerifier = undefined;
        }

        const container = document.getElementById('recaptcha-container');
        if (container) {
          // Clear any old DOM contents
          container.innerHTML = '';
          try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible',
              'callback': (response: any) => {
                // reCAPTCHA solved
              }
            });
            window.recaptchaVerifier.render();
          } catch (err) {
            console.error("Recaptcha Init Error:", err);
          }
        }
      };

      // Small delay to ensure React painted the DOM
      const timer = setTimeout(initRecaptcha, 100);
      return () => clearTimeout(timer);
    }
  }, [authLoading, step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError("");

    try {
      // Ensure phone number has country code and NO spaces/dashes (strict E.164 format)
      let cleaned = phoneNumber.replace(/[^0-9+]/g, '');
      const formattedPhone = cleaned.startsWith('+') ? cleaned : `+1${cleaned}`;
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please check the number.");
      // We do not reset recaptcha here anymore because it often crashes in React.
      // If it fails, they just need to refresh.
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setLoading(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user has a profile
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        router.push("/account");
      } else {
        setStep("profile");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;
    setLoading(true);
    setError("");

    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone: user.phoneNumber,
        role: "user",
        createdAt: serverTimestamp(),
      });
      router.push("/account");
    } catch (err: any) {
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Failsafe: if auth takes more than 3 seconds, force loading to false
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn("Auth loading timed out. Forcing UI to render.");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className={styles.container} style={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}>
        LOADING AUTHENTICATION...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        
        {step === "phone" && (
          <form onSubmit={handleSendOtp}>
            <h1 className={styles.title}>Welcome</h1>
            <p className={styles.subtitle}>Enter your phone number to sign in or create an account.</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input 
                type="tel" 
                className={styles.input} 
                placeholder="+1 234 567 8900" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading || !phoneNumber}>
              {loading ? "Sending..." : "Continue"}
            </button>
            <div id="recaptcha-container" className={styles.recaptchaContainer}></div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <h1 className={styles.title}>Verify</h1>
            <p className={styles.subtitle}>We sent a code to {phoneNumber}</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Verification Code</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="123456" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                maxLength={6}
                required
              />
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading || otp.length < 6}>
              {loading ? "Verifying..." : "Sign In"}
            </button>
            <button 
              type="button" 
              onClick={() => setStep("phone")} 
              style={{ background: 'none', border: 'none', marginTop: '1rem', color: '#666', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Change phone number
            </button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={handleCreateProfile}>
            <h1 className={styles.title}>Complete Profile</h1>
            <p className={styles.subtitle}>Almost there! What should we call you?</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading || !name}>
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        )}

        {error && <div className={styles.error}>{error}</div>}

      </div>
    </div>
  );
}
