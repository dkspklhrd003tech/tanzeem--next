"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

// ─── 3D Cinematic Background ──────────────────────────────────────────────────

function CinematicScene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, -20]}>
          <torusKnotGeometry args={[9, 3, 128, 32]} />
          <meshStandardMaterial
            color="#0d5844"
            wireframe
            transparent
            opacity={0.15}
            emissive="#0d5844"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
    </group>
  );
}

// ─── Password Strength Helper ─────────────────────────────────────────────────

function getPasswordStrength(password: string) {
  let score = 0;
  if (!password) return score;
  if (password.length > 5) score += 1;
  if (password.length > 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(5, score);
}

function PasswordStrengthBar({ password }: { password: string }) {
  const score = getPasswordStrength(password);
  const percent = (score / 5) * 100;

  const label = score === 0 ? "" : score < 3 ? "Weak" : score < 5 ? "Average" : "Strong";

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-gray-300 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(to right, #dc2626, #f97316, #eab308, #84cc16, #22c55e)",
            backgroundSize: "500% 100%",
            backgroundPosition: `${100 - percent}% 0`,
          }}
        />
      </div>
      <p className="text-[12px] text-primary mt-1 text-right">{label}</p>
    </div>
  );
}

// ─── LoginForm Component ──────────────────────────────────────────────────────

type ViewMode = "login" | "forgot" | "verify" | "reset";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/sitemanager/dashboard";

  // Login Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});

  // View State
  const [mode, setMode] = useState<ViewMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Fields
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Fetch Settings
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          const loginSettings = data.settings.login || {};
          const identitySettings = data.settings.general || {};
          setSettings({ ...identitySettings, ...loginSettings });
        }
      })
      .catch(err => console.error("Failed to load settings:", err));

    const saved = localStorage.getItem("sm_remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) setError("Invalid email or password. Please try again.");
        else if (res.status === 403) setError("Your account has been deactivated. Contact a super admin.");
        else setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (rememberMe) localStorage.setItem("sm_remember_email", email);
      else localStorage.removeItem("sm_remember_email");

      router.push(callbackUrl);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) return setError("Please enter your email.");

    setIsLoading(true);
    try {
      // MOCK API CALL for OTP generation
      // In a real app, this would be a real API route
      await new Promise(r => setTimeout(r, 1000));

      setSuccess("A 6-digit code has been sent to your email.");
      setMode("verify");
    } catch {
      setError("Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (otp.length !== 6) return setError("Please enter a valid 6-digit code.");

    setIsLoading(true);
    try {
      // MOCK API CALL for OTP verification
      await new Promise(r => setTimeout(r, 1000));

      setMode("reset");
    } catch {
      setError("Invalid code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    if (getPasswordStrength(newPassword) < 3) return setError("Please choose a stronger password.");

    setIsLoading(true);
    try {
      // MOCK API CALL for Password Reset
      await new Promise(r => setTimeout(r, 1000));

      setSuccess("Password reset successfully. You can now log in.");
      setMode("login");
      setPassword("");
    } catch {
      setError("Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4">

      {/* 3D Cinematic Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#0d5844" />
          <CinematicScene />
        </Canvas>
      </div>

      {/* Dynamic Background Image Overlay */}
      {settings.login_bg_image && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-opacity duration-1000"
          style={{ backgroundImage: `url('${resolveMediaUrl(settings.login_bg_image)}')` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-0" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(13,88,68,0.3)] overflow-hidden border border-white/20">

          <div className="p-6">
            {/* Logo area */}
            <div className="flex flex-col items-center mb-4">
              {settings.site_logo && settings.site_logo !== "null" && settings.site_logo !== "undefined" && settings.site_logo.trim() !== "" ? (
                <img src={resolveMediaUrl(settings.site_logo)} alt="Site Logo" className="max-w-[120px] h-auto mb-5 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg mb-5">
                  <span className="text-white font-bold text-3xl leading-none">ت</span>
                </div>
              )}
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {mode === "login" ? "Welcome back" : mode === "forgot" ? "Reset Password" : mode === "verify" ? "Verify Code" : "Create Password"}
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 font-medium text-center">
                {mode === "login" ? "Sign in to the Tanzeem Site Manager" :
                  mode === "forgot" ? "Enter your email to receive a recovery code." :
                    mode === "verify" ? "Enter the 6-digit code sent to your email." :
                      "Secure your account with a strong password."}
              </p>
            </div>

            <AnimatedAlert message={error} type="error" />
            <AnimatedAlert message={success} type="success" />

            <AnimatePresence mode="wait">
              {/* LOGIN MODE */}
              {mode === "login" && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLoginSubmit} className="space-y-5" noValidate
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@tanzeem.org"
                        className={cn(
                          "w-full h-11 pl-8 pr-2 rounded-xl border text-sm transition-all",
                          "bg-gray-50 text-gray-900 placeholder:text-gray-400",
                          error && "border-red-400 focus:border-red-400 focus:ring-red-200"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between py-2">
                      <label className="block text-sm font-semibold text-gray-700">Password</label>
                      <button type="button" onClick={() => { setMode("forgot"); setError(null); setSuccess(null); }} className="cursor-pointer text-xs text-primary hover:text-primary/80 font-bold transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          "w-full h-11 pl-8 pr-2 rounded-xl border text-sm transition-all",
                          "bg-gray-50 text-gray-900 placeholder:text-gray-400",
                          error && "border-red-400 focus:border-red-400 focus:ring-red-200"
                        )}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5 text-primary" /> : <Eye className="h-5 w-5 text-primary" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={password} />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit" disabled={isLoading || !email || !password}
                    className="w-full h-12 mt-2 rounded-xl font-bold text-sm text-white transition-all bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                  >
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</> : "Sign In Securely"}
                  </button>
                </motion.form>
              )}

              {/* FORGOT PASSWORD MODE */}
              {mode === "forgot" && (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleForgotSubmit} className="space-y-5" noValidate
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@tanzeem.org"
                        className="w-full h-11 pl-4 pr-4 rounded-xl border text-sm transition-all bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setMode("login")} className="h-12 px-4 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button type="submit" disabled={isLoading || !email} className="flex-1 h-12 rounded-xl font-bold text-sm text-white transition-all bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center shadow-lg shadow-primary/30">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Recovery Code"}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* VERIFY MODE */}
              {mode === "verify" && (
                <motion.form
                  key="verify-form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifySubmit} className="space-y-5" noValidate
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">6-Digit OTP Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border text-center text-lg tracking-[0.5em] font-mono transition-all bg-gray-50 text-gray-900 placeholder:text-gray-300 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setMode("forgot")} className="h-12 px-4 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button type="submit" disabled={isLoading || otp.length !== 6} className="flex-1 h-12 rounded-xl font-bold text-sm text-white transition-all bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center shadow-lg shadow-primary/30">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* RESET PASSWORD MODE */}
              {mode === "reset" && (
                <motion.form
                  key="reset-form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetSubmit} className="space-y-5" noValidate
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-4 pr-4 rounded-xl border text-sm transition-all bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={newPassword} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-10 rounded-xl border text-sm transition-all bg-gray-50 text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading || !newPassword || !confirmPassword} className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center shadow-lg shadow-primary/30">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save New Password"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Configurable Footer Text */}
            <p className="mt-6 text-center text-xs font-medium text-gray-500">
              {settings.login_footer_text || (
                <a href="/" className="hover:text-primary transition-colors">← Back to Website</a>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Animated Alert Helper ────────────────────────────────────────────────────

function AnimatedAlert({ message, type }: { message: string | null, type: "error" | "success" }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium border",
        isError ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
      )}
    >
      {isError ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
      <span>{message}</span>
    </motion.div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function SiteManagerLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
