"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyWidgetToken, completeProfile } from "@/app/actions/auth";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

const WIDGET_SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];

// Module-level (not component state) since the widget script/init must only
// ever happen once per page load, regardless of how many times this
// component's effect fires (React Strict Mode runs effects twice in dev).
const widgetScriptState: { status: "idle" | "loading" | "ready"; onReady: Array<() => void> } = {
  status: "idle",
  onReady: [],
};

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [widgetReady, setWidgetReady] = useState(false);

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
  const { user, loading: authLoading, refresh } = useAuth();

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

  // Load the MSG91 widget script once and initialize it with exposeMethods
  // so we keep our own custom UI instead of MSG91's popup. Guarded against
  // React's dev-mode double-effect-invocation (and any remounts) with a
  // module-level flag -- without it, initSendOTP fires twice and hCaptcha
  // throws "already rendered" trying to mount into the same container twice.
  useEffect(() => {
    if (typeof window.sendOtp === "function") {
      // Already initialized (e.g. by a previous mount of this effect)
      setWidgetReady(true);
      return;
    }
    if (widgetScriptState.status === "ready") {
      setWidgetReady(true);
      return;
    }
    if (widgetScriptState.status === "loading") {
      widgetScriptState.onReady.push(() => setWidgetReady(true));
      return;
    }

    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
    const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;
    if (!widgetId || !tokenAuth) {
      console.error("MSG91 widget is not configured (missing widgetId/tokenAuth)");
      return;
    }

    widgetScriptState.status = "loading";

    const configuration = {
      widgetId,
      tokenAuth,
      exposeMethods: true,
      captchaRenderId: "msg91-captcha",
      success: () => {}, // we listen on verifyOtp's own callback instead, per MSG91's docs note
      failure: (error: any) => {
        console.error("MSG91 widget error:", error);
      },
    };

    function attempt(i: number) {
      const s = document.createElement("script");
      s.src = WIDGET_SCRIPT_URLS[i];
      s.async = true;
      s.onload = () => {
        if (typeof window.initSendOTP === "function") {
          window.initSendOTP(configuration);
          widgetScriptState.status = "ready";
          setWidgetReady(true);
          widgetScriptState.onReady.forEach((cb) => cb());
          widgetScriptState.onReady = [];
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
    if (!phoneNumber) return;
    if (cooldown > 0) return;
    if (!widgetReady || !window.sendOtp) {
      setError("Still connecting to the OTP service, please try again in a moment.");
      return;
    }

    setLoading(true);
    setError("");

    // MSG91's widget wants the identifier with country code and no leading '+'
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
        setError(err?.message || "Failed to send OTP. Please check the number.");
        setLoading(false);
      }
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !window.verifyOtp) return;
    setLoading(true);
    setError("");

    window.verifyOtp(
      otp,
      async (data: any) => {
        try {
          // MSG91's docs don't spell out the exact field name here -- trying
          // the shapes most commonly returned by their widget.
          const accessToken =
            typeof data === "string" ? data : data?.message ?? data?.["access-token"] ?? data?.token;

          if (!accessToken) {
            setError("Verification succeeded but no token was returned.");
            setLoading(false);
            return;
          }

          const res = await verifyWidgetToken(accessToken);
          if (res.success) {
            await refresh();
            // the effect above handles redirecting once `user` updates
          } else {
            setError(res.error || "Verification failed. Please try again.");
            setLoading(false);
          }
        } catch {
          setError("Verification failed. Please try again.");
          setLoading(false);
        }
      },
      (err: any) => {
        setError(err?.message || "Invalid OTP code.");
        setLoading(false);
      }
    );
  };

  const handleResendOtp = () => {
    if (cooldown > 0 || !window.retryOtp) return;
    setLoading(true);
    setError("");

    // `null` channel because this widget is configured with the default
    // global template, per MSG91's own docs.
    window.retryOtp(
      null,
      () => {
        setCooldown(60);
        localStorage.setItem("otpCooldownTime", (Date.now() + 60000).toString());
        setLoading(false);
      },
      (err: any) => {
        setError(err?.message || "Failed to resend OTP.");
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
        email: email || undefined,
      });

      if (res.success) {
        await refresh();
        router.push("/account");
      } else {
        setError(res.error || "Failed to sync profile");
      }
    } catch {
      setError("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
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

            <button type="submit" className={styles.submitBtn} disabled={loading || !phoneNumber || cooldown > 0 || !widgetReady}>
              {cooldown > 0 ? `Wait ${cooldown}s` : (loading ? "Sending..." : "Continue")}
            </button>

            <div id="msg91-captcha" style={{ marginTop: "1rem" }}></div>
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
                  onClick={handleResendOtp}
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
