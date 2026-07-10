"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { verifyWidgetToken, completeProfile } from "@/app/actions/auth";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const WIDGET_SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];

// Module-level state to prevent double script loading in strict mode
const widgetScriptState: { status: "idle" | "loading" | "ready"; onReady: Array<() => void> } = {
  status: "idle",
  onReady: [],
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpArray, setOtpArray] = useState<string[]>(["", "", "", ""]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [widgetReady, setWidgetReady] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();

  // Handle redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const isProfileComplete = user.displayName && user.displayName.trim() !== "";
      if (isProfileComplete) {
        router.push("/account");
      } else if (step !== "profile") {
        setStep("profile");
      }
    }
  }, [user, authLoading, router, step]);

  // Handle cooldown timer for resend OTP
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

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Load and initialize MSG91 script
  useEffect(() => {
    if (typeof window.sendOtp === "function" || widgetScriptState.status === "ready") {
      setWidgetReady(true);
      return;
    }
    if (widgetScriptState.status === "loading") {
      widgetScriptState.onReady.push(() => setWidgetReady(true));
      return;
    }

    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "36676a6a3033323538333831";
    const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || "549204TtKoEKk2FsO36a50c429P1";

    widgetScriptState.status = "loading";

    const configuration = {
      widgetId,
      tokenAuth,
      exposeMethods: true,
      captchaRenderId: "msg91-captcha",
      success: () => {}, 
      failure: (error: any) => console.error("MSG91 widget error:", error),
    };

    function attempt(i: number) {
      const s = document.createElement("script");
      s.src = WIDGET_SCRIPT_URLS[i];
      s.async = true;
      s.onload = () => {
        const w = window as any;
        if (typeof window.initSendOTP === "function" && !w.__msg91_initialized) {
          w.__msg91_initialized = true;
          window.initSendOTP(configuration);
          widgetScriptState.status = "ready";
          setWidgetReady(true);
          widgetScriptState.onReady.forEach((cb) => cb());
          widgetScriptState.onReady = [];
        } else if (w.__msg91_initialized) {
          widgetScriptState.status = "ready";
          setWidgetReady(true);
        }
      };
      s.onerror = () => {
        if (i + 1 < WIDGET_SCRIPT_URLS.length) {
          attempt(i + 1);
        } else {
          widgetScriptState.status = "idle";
        }
      };
      document.head.appendChild(s);
    }
    attempt(0);
  }, []);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber || cooldown > 0) return;
    
    if (!widgetReady || !window.sendOtp) {
      setError("Still connecting to the security service, please wait a moment.");
      return;
    }

    setLoading(true);
    setError("");

    const cleaned = phoneNumber.replace(/[^0-9]/g, "");
    const identifier = cleaned.length === 10 ? `91${cleaned}` : cleaned;

    window.sendOtp(
      identifier,
      () => {
        setStep("otp");
        setCooldown(60);
        localStorage.setItem("otpCooldownTime", (Date.now() + 60000).toString());
        setLoading(false);
      },
      (err: any) => {
        setError(err?.message || "Failed to send verification code. Please check your number.");
        setLoading(false);
      }
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpArray.join('');
    if (otp.length < 4 || !window.verifyOtp || loading) return;
    
    setLoading(true);
    setError("");

    window.verifyOtp(
      otp,
      async (data: any) => {
        try {
          const accessToken = typeof data === "string" ? data : data?.message ?? data?.["access-token"] ?? data?.token;

          if (!accessToken) {
            setError("Security token missing from verification response.");
            setLoading(false);
            return;
          }

          const res = await verifyWidgetToken(accessToken);
          if (res.success) {
            await refresh();
            setLoading(false);
          } else {
            setError(res.error || "Server verification failed.");
            setLoading(false);
          }
        } catch {
          setError("An unexpected error occurred during verification.");
          setLoading(false);
        }
      },
      (err: any) => {
        setError(err?.message || "Incorrect verification code.");
        setLoading(false);
      }
    );
  };

  const handleResendOtp = () => {
    if (cooldown > 0 || !window.retryOtp) return;
    setLoading(true);
    setError("");

    window.retryOtp(
      null,
      () => {
        setCooldown(60);
        localStorage.setItem("otpCooldownTime", (Date.now() + 60000).toString());
        setLoading(false);
      },
      (err: any) => {
        setError(err?.message || "Failed to resend code.");
        setLoading(false);
      }
    );
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;
    setLoading(true);
    setError("");

    try {
      const res = await completeProfile({
        displayName: name,
        email: email,
      });

      if (res.success) {
        await refresh();
        router.push("/account");
      } else {
        setError(res.error || "Failed to save profile.");
      }
    } catch (err: any) {
      console.error("Client side complete profile error:", err);
      setError(`An unexpected error occurred: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/[^0-9]/g, "");
    if (!val && value !== "") return;
    
    const newOtp = [...otpArray];
    newOtp[index] = val.substring(val.length - 1);
    setOtpArray(newOtp);

    // Auto-advance
    if (val && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

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
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.div
                key="phone"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ type: "tween", ease: "anticipate", duration: 0.4 }}
                className={styles.formContentWrapper}
              >
                <form onSubmit={handleSendOtp}>
                  <h1 className={styles.title}>Welcome</h1>
                  <p className={styles.subtitle}>Enter your mobile number to securely sign in or create an account.</p>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mobile Number</label>
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
                  
                  {/* Captcha Pop-up moved below input, elegantly styled */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.captchaPopup}
                  >
                    <div id="msg91-captcha"></div>
                  </motion.div>

                  <button type="submit" className={styles.submitBtn} disabled={loading || !phoneNumber || cooldown > 0 || !widgetReady}>
                    {cooldown > 0 ? `Wait ${cooldown}s` : (loading ? "Sending Code..." : "Continue")}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ type: "tween", ease: "anticipate", duration: 0.4 }}
                className={styles.formContentWrapper}
              >
                <form onSubmit={handleVerifyOtp}>
                  <h1 className={styles.title}>Verify</h1>
                  <p className={styles.subtitle}>We sent a code to {phoneNumber}</p>

                  <div className={styles.formGroup}>
                    <label className={styles.label} style={{ textAlign: "center" }}>Verification Code</label>
                    <div className={styles.otpContainer}>
                      {[0, 1, 2, 3].map((index) => (
                        <input
                          key={index}
                          ref={(el) => { otpRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          className={styles.otpBox}
                          value={otpArray[index]}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          disabled={loading}
                          maxLength={1}
                          required
                        />
                      ))}
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={loading || otpArray.join('').length < 4}>
                    {loading ? "Verifying..." : "Secure Sign In"}
                  </button>

                  <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                    {cooldown > 0 ? (
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Resend code in {cooldown}s</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', padding: 0 }}
                      >
                        Resend Code
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => { setStep("phone"); setError(""); setOtpArray(["", "", "", ""]); }}
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                    >
                      Change phone number
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "profile" && (
              <motion.div
                key="profile"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ type: "tween", ease: "anticipate", duration: 0.4 }}
                className={styles.formContentWrapper}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={styles.error}
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
