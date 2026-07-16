"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function ContactForm({ settings = {} }: { settings?: Record<string, string> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Controlled state — prevents browser autocomplete from persisting stale values across reloads
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Clear red borders as soon as the user starts interacting with any field
  const clearErrors = () => { if (attemptedSubmit) setAttemptedSubmit(false); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!e.currentTarget.checkValidity()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "contact",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSubmitted(true);
      // Reset all fields after successful submission
      setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage("");
      setAttemptedSubmit(false);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {settings.form_success_heading || "Message Sent Successfully!"}
        </h3>
        <p className="text-foreground-muted mb-6">
          {settings.form_success_message || "Thank you for contacting us. We'll respond within 24-48 hours."}
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
          className="rounded-xl bg-primary text-primary-foreground"
        >
          Send Another Message
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      noValidate
      autoComplete="off"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{settings.form_name_label || "Full Name *"}</Label>
          <Input
            id="name"
            name="name"
            autoComplete="new-password"
            value={name}
            onChange={(e) => { setName(e.target.value); clearErrors(); }}
            placeholder={settings.form_name_placeholder || "Your name"}
            required
            className={`bg-background ${attemptedSubmit && !name.trim() ? "border-red-500 ring-red-500 ring-1" : ""}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{settings.form_email_label || "Email Address *"}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="new-password"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
            placeholder={settings.form_email_placeholder || "your@email.com"}
            required
            className={`bg-background ${attemptedSubmit && !email.trim() ? "border-red-500 ring-red-500 ring-1" : ""}`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">{settings.form_phone_label || "Phone Number"}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="new-password"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); clearErrors(); }}
            placeholder={settings.form_phone_placeholder || "+92 XXX XXX XXXX"}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">{settings.form_subject_label || "Subject *"}</Label>
          <Input
            id="subject"
            name="subject"
            autoComplete="new-password"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); clearErrors(); }}
            placeholder={settings.form_subject_placeholder || "What is this about?"}
            required
            className={`bg-background ${attemptedSubmit && !subject.trim() ? "border-red-500 ring-red-500 ring-1" : ""}`}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="message">{settings.form_message_label || "Message *"}</Label>
        <Textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); clearErrors(); }}
          placeholder={settings.form_message_placeholder || "Write your message here..."}
          rows={6}
          required
          className={`bg-background ${attemptedSubmit && !message.trim() ? "border-red-500 ring-red-500 ring-1" : ""}`}
        />
      </div>

      <Button
        type="submit"
        className="w-full md:w-auto rounded-xl bg-primary text-primary-foreground"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {settings.form_submit_button || "Send Message"}
          </>
        )}
      </Button>
    </motion.form>
  );
}