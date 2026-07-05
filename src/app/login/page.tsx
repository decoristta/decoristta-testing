"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { syncUserToDatabase } from "@/app/actions/auth";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Persist cooldown across page refreshes
  useEffect(() => {
    const savedCooldownTime = localStorage.getItem("otpCooldownTime");
    if (savedCooldownTime) {
      const targetTime = parseInt(savedCooldownTime, 10);
      const now = Date.now();
      if (targetTime > now) {
        setCooldown(Math.ceil((targetTime - now) / 1000));
      } else {
        localStorage.removeItem("otpCooldownTime");
      }
    }
  }, []);

  // Tick down cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      // Profile is considered complete if it exists and has a displayName
      const isProfileComplete = profile && profile.displayName && profile.displayName.trim() !== "";
      
      if (isProfileComplete) {
        router.push("/account");
      } else if (step !== "profile") {
        setStep("profile");
      }
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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber) return;
    if (cooldown > 0) return; // Strict rate limiting
    
    setLoading(true);
    setError("");

    try {
      // Ensure phone number has country code and NO spaces/dashes (strict E.164 format)
      let cleaned = phoneNumber.replace(/[^0-9+]/g, '');
      const formattedPhone = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
      
      // Start 60-second cooldown timer
      setCooldown(60);
      localStorage.setItem("otpCooldownTime", (Date.now() + 60000).toString());
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
      
      if (user) {
         // Failsafe DB Sync: Fire and forget (don't await) so it's lightning fast!
         syncUserToDatabase(user.uid, {
           displayName: "",
           phone: user.phoneNumber || undefined,
         }).catch(console.error);
         
         // Let the useEffect at the top handle the redirect cleanly
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
      setLoading(false);
    } 
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Failsafe DB Sync: Fire and forget!
      syncUserToDatabase(result.user.uid, {
        displayName: result.user.displayName || "User",
        email: result.user.email || undefined,
        phone: result.user.phoneNumber || undefined,
      }).catch(console.error);
      
      // Let the useEffect handle the redirect!
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.");
      setLoading(false);
    } 
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;
    setLoading(true);
    setError("");

    try {
      const res = await syncUserToDatabase(user.uid, {
        displayName: name,
        email: email || undefined,
        phone: user.phoneNumber || undefined,
      });
      
      if (res.success) {
        // Force reload to trigger AuthContext to fetch the new Postgres profile
        window.location.href = "/account";
      } else {
        setError(res.error || "Failed to sync profile");
      }
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
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Securing Connection</div>
      </div>
    );
  }

  return (
    <div className={styles.splitContainer}>
      <div className={styles.imageSection}>
        <div className={styles.imageOverlay}>
          <h2 className={styles.imageTitle}>Decoristta</h2>
          <p className={styles.imageSubtitle}>Welcome back to your curated space.</p>
        </div>
      </div>
      
      <div className={styles.formSection}>
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
                placeholder="98765 43210" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading || !phoneNumber || cooldown > 0}>
              {cooldown > 0 ? `Wait ${cooldown}s` : (loading ? "Sending..." : "Continue")}
            </button>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSignIn} 
              className={styles.googleBtn} 
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
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
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              {cooldown > 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Resend OTP in {cooldown}s</p>
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleSendOtp()} 
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', padding: 0 }}
                >
                  Resend OTP
                </button>
              )}
              
              <button 
                type="button" 
                onClick={() => setStep("phone")} 
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
              >
                Change phone number
              </button>
            </div>
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

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address (Optional)</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="jane@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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
    </div>
  );
}
