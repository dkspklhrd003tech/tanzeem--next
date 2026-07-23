"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, RefreshCw, Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// ── Membership tiers ──────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "rafeeq",
    label: "RAFEEQ",
    urduLabel: "رفیق",
    gender: "Male",
    description:
      "A male companion who takes the pledge (Bay'ah) and commits to the mission of establishing the Deen.",
    obligations: [
      "Daily recitation of the Quran",
      "Establishment of Salah with congregation",
      "Monthly attendance at organisational meetings",
      "Active participation in da'wah activities",
      "Monthly contribution to the organisation",
    ],
    color: "border-primary bg-primary/5",
    activeColor: "border-primary bg-primary text-white",
  },
  {
    id: "rafeeqah",
    label: "RAFEEQAH",
    urduLabel: "رفیقہ",
    gender: "Female",
    description:
      "A female companion who takes the pledge (Bay'ah) and commits to spreading the message of the Quran.",
    obligations: [
      "Daily recitation of the Quran",
      "Establishment of Salah regularly",
      "Monthly attendance at sisters' halaqah",
      "Participation in da'wah within family and community",
      "Monthly contribution to the organisation",
    ],
    color: "border-primary bg-primary/5",
    activeColor: "border-primary bg-primary text-white",
  },
];

type Tier = "rafeeq" | "rafeeqah" | "";

interface FormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  occupation: string;
  message: string;
  tier: Tier;
}

const EMPTY: FormState = {
  name: "", email: "", phone: "", city: "", occupation: "", message: "", tier: "",
};

export function JoinPage() {
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tier) {
      toast({ variant: "destructive", title: "Please select a membership type." });
      return;
    }
    if (!executeRecaptcha) {
      toast({ variant: "destructive", title: "ReCAPTCHA is not ready. Please try again." });
      return;
    }

    setSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("join_form");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "join",
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Join Request — ${form.tier.toUpperCase()} — ${form.city}`,
          message: `Occupation: ${form.occupation}\nMembership Type: ${form.tier}\n\n${form.message}`,
          recaptchaToken
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      toast({ variant: "destructive", title: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className=" bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-xl p-10 text-center max-w-md shadow-deep"
        >
          <CheckCircle className="h-14 w-14 text-primary mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-foreground mb-3">JazakAllah Khair!</h2>
          <p className="text-foreground-muted leading-relaxed">
            Your membership application has been received. A representative from Tanzeem-e-Islami
            will contact you shortly. May Allah bless your intention.
          </p>
          <Button className="mt-6 border-primary/20 bg-primary text-white rounded-full" onClick={() => { setForm(EMPTY); setSubmitted(false); }}>
            Submit Another
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className=" bg-background">
      {/* Hero */}
      <section className="bg-primary py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} aria-hidden="true" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="container relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
          <Users className="h-12 w-12 text-primary-foreground/70 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Join Tanzeem-e-Islami</h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            Become a RAFEEQ or RAFEEQAH — a companion in the mission to revive and establish the
            complete Deen of Islam.
          </p>
        </motion.div>
      </section>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Tier selection */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-5 text-center">Choose Your Membership Type</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TIERS.map((tier) => {
              const isActive = form.tier === tier.id;
              return (
                <motion.button
                  key={tier.id}
                  type="button"
                  onClick={() => set("tier", tier.id as Tier)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "text-left rounded-xl border-2 p-6 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring",
                    isActive ? tier.activeColor : tier.color
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isActive ? "bg-white/20" : "bg-primary/10")}>
                      <User className={cn("h-5 w-5", isActive ? "text-white" : "text-primary")} />
                    </div>
                    <div>
                      <p className={cn("font-bold text-lg", isActive ? "text-white" : "text-foreground")}>{tier.label}</p>
                      <p className={cn("text-sm font-nastaleeq", isActive ? "text-white/70" : "text-primary/70")} dir="rtl" lang="ur">{tier.urduLabel}</p>
                    </div>
                    <span className={cn("ml-auto text-xs px-2 py-1 rounded-full", isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>{tier.gender}</span>
                  </div>
                  <p className={cn("text-sm leading-relaxed mb-4", isActive ? "text-white/80" : "text-foreground-muted")}>{tier.description}</p>
                  <ul className="space-y-1.5">
                    {tier.obligations.map((ob, i) => (
                      <li key={i} className={cn("flex items-start gap-2 text-xs", isActive ? "text-white/80" : "text-foreground-muted")}>
                        <CheckCircle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isActive ? "text-white/60" : "text-primary/50")} />
                        {ob}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Application form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm space-y-5"
        >
          <h2 className="text-lg font-bold text-foreground mb-1">Application Form</h2>
          <p className="text-sm text-foreground-muted mb-4">
            Fill in your details and a local representative will be in touch.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="jn-name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="jn-name" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jn-email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="jn-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jn-phone">Phone / WhatsApp <span className="text-destructive">*</span></Label>
              <Input id="jn-phone" type="tel" required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 0000000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jn-city">City <span className="text-destructive">*</span></Label>
              <Input id="jn-city" required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Lahore" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jn-occupation">Occupation</Label>
              <Input id="jn-occupation" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="e.g. Teacher, Engineer, Student" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="jn-message">Additional Message</Label>
              <Textarea id="jn-message" rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Anything else you'd like us to know…" className="resize-none" />
            </div>
          </div>

          {!form.tier && (
            <p className="text-xs text-destructive">Please select RAFEEQ or RAFEEQAH above before submitting.</p>
          )}

          <Button
            type="submit"
            disabled={submitting || !form.tier}
            className="w-full md:w-auto border-primary/20 bg-primary text-white rounded-full px-10 py-3 font-semibold"
          >
            {submitting ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Submitting…</> : <><Send className="h-4 w-4 mr-2" />Submit Application</>}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
