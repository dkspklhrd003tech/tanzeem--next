"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Inner component that uses useSearchParams — must be wrapped in Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/sitemanager/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill remembered email
  useEffect(() => {
    const saved = localStorage.getItem("sm_remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Map specific error messages to user-friendly text
        if (res.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else if (res.status === 403) {
          setError("Your account has been deactivated. Contact a super admin.");
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      // Persist email if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem("sm_remember_email", email);
      } else {
        localStorage.removeItem("sm_remember_email");
      }

      router.push(callbackUrl);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-emerald-800/80" />

      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-primary" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <span className="text-white font-bold text-3xl leading-none">ت</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to the Tanzeem Site Manager</p>
            </div>

            {/* Error alert */}
            <AnimatedError error={error} />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tanzeem.org"
                    className={cn(
                      "w-full h-11 pl-10 pr-4 rounded-lg border text-sm transition-all",
                      "bg-gray-50 text-gray-900 placeholder:text-gray-400",
                      "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                      error && "border-red-400 focus:border-red-400 focus:ring-red-200"
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full h-11 pl-10 pr-10 rounded-lg border text-sm transition-all",
                      "bg-gray-50 text-gray-900 placeholder:text-gray-400",
                      "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                      error && "border-red-400 focus:border-red-400 focus:ring-red-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30 accent-primary cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className={cn(
                  "w-full h-11 rounded-lg font-semibold text-sm text-white transition-all",
                  "bg-primary hover:bg-primary/90 active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
                  "flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-gray-400">
              <a
                href="/"
                className="hover:text-primary transition-colors"
              >
                ← Back to website
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Animated error box ───────────────────────────────────────────────────────

function AnimatedError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{error}</span>
    </motion.div>
  );
}

// ─── Page export — wraps in Suspense to satisfy useSearchParams requirement ───

export default function SiteManagerLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
