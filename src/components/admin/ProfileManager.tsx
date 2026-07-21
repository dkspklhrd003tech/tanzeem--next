"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, User, Mail, Image as ImageIcon } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

export function ProfileManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setAvatar(data.user.avatar || "");
        }
      })
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Quick reload to update the layout user context
      setTimeout(() => window.location.reload(), 1000);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="pb-4 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-sm text-foreground-muted mt-1">Update your personal information and avatar.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <ImageUploader
              label="Avatar Image"
              value={avatar}
              onChange={(url) => setAvatar(url)}
              aspectRatio={1}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin User"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tanzeem.org"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button type="submit" disabled={isSaving} className="bg-primary text-white hover:text-muted hover:bg-primary/90 min-w-[120px]">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
