"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export function ChangePasswordManager() {
  const { toast } = useToast();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return score;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(5, score);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New password and confirmation do not match.",
      });
    }

    if (getPasswordStrength(newPassword) < 3) {
      return toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Please choose a stronger password.",
      });
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. Please log in again.",
      });

      // Clear the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Log out user for security reasons after password change
      setTimeout(() => {
        fetch("/api/auth/logout", { method: "POST" })
          .then(() => router.push("/sitemanager/login"));
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const strength = getPasswordStrength(newPassword);
  const percent = (strength / 5) * 100;
  const strengthLabel = strength === 0 ? "" : strength < 3 ? "Weak" : strength < 5 ? "Average" : "Strong";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-6"
    >
      <div className="pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Change Password</h1>
        <p className="text-sm text-foreground-muted mt-1">Ensure your account is using a long, random password to stay secure.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="space-y-4">

          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">Current Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword.current ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="my-6 border-b border-border" />

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword.new ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
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
              <p className="text-[12px] text-muted-foreground mt-1 text-right">{strengthLabel}</p>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirm New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword.confirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button type="submit" disabled={isSaving || !currentPassword || !newPassword || !confirmPassword} className="bg-primary text-white hover:bg-primary/90 min-w-[150px]">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
