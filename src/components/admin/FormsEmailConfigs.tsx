"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Loader2, Server, Mail, Eye, EyeOff, Info, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const FormsEmailConfigs = forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // ── Notification settings (group: form_email) ────────────────────────────
  const [sendToEmail, setSendToEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  // ── SMTP credentials (group: smtp) ──────────────────────────────────────
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSecure, setSmtpSecure] = useState("true");
  const [smtpFrom, setSmtpFrom] = useState("");

  // ── Success Message (group: contact) ────────────────────────────────────
  const [successHeading, setSuccessHeading] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { toast } = useToast();

  useImperativeHandle(ref, () => ({ save: handleSave }));

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();

          const fe = data.settings?.form_email || {};
          if (fe.sendToEmail) setSendToEmail(fe.sendToEmail);
          if (fe.emailSubject) setEmailSubject(fe.emailSubject);
          if (fe.fromName) setFromName(fe.fromName);
          if (fe.fromEmail) setFromEmail(fe.fromEmail);
          if (fe.replyTo) setReplyTo(fe.replyTo);

          const smtp = data.settings?.smtp || {};
          if (smtp.smtp_host) setSmtpHost(smtp.smtp_host);
          if (smtp.smtp_port) setSmtpPort(smtp.smtp_port);
          if (smtp.smtp_user) setSmtpUser(smtp.smtp_user);
          if (smtp.smtp_pass) setSmtpPass(smtp.smtp_pass);
          if (smtp.smtp_secure !== undefined) setSmtpSecure(smtp.smtp_secure);
          if (smtp.smtp_from) setSmtpFrom(smtp.smtp_from);

          const contact = data.settings?.contact || {};
          if (contact.form_success_heading) setSuccessHeading(contact.form_success_heading);
          if (contact.form_success_message) setSuccessMessage(contact.form_success_message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group: "form_email",
            settings: { sendToEmail, emailSubject, fromName, fromEmail, replyTo },
          }),
        }).then((r) => { if (!r.ok) throw new Error("form_email save failed"); }),

        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group: "smtp",
            settings: {
              smtp_host: smtpHost,
              smtp_port: smtpPort,
              smtp_user: smtpUser,
              smtp_pass: smtpPass,
              smtp_secure: smtpSecure,
              smtp_from: smtpFrom,
            },
          }),
        }).then((r) => { if (!r.ok) throw new Error("smtp save failed"); }),

        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group: "contact",
            settings: {
              form_success_heading: successHeading,
              form_success_message: successMessage,
            },
          }),
        }).then((r) => { if (!r.ok) throw new Error("contact save failed"); }),
      ]);

      toast({ title: "Saved", description: "All email configurations saved successfully." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not save configuration.", variant: "destructive" });
    }
  };

  const field = "h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-primary";

  const SectionHeader = ({
    icon: Icon,
    title,
    description,
    iconBg = "bg-primary/10",
    iconColor = "text-primary",
  }: {
    icon: any;
    title: string;
    description: string;
    iconBg?: string;
    iconColor?: string;
  }) => (
    <div className="flex items-start gap-3 mb-6 pb-4 border-b border-slate-100">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Notification Settings ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <SectionHeader
              icon={Mail}
              title="Notification Settings"
              description="Where form submissions are delivered and how outgoing emails appear to recipients."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Send To Email Address</Label>
                <p className="text-[11px] text-slate-400">Admin email that receives all form submissions.</p>
                <Input value={sendToEmail} onChange={(e) => setSendToEmail(e.target.value)} placeholder="admin@yourdomain.com" type="email" className={field} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Subject Line</Label>
                <p className="text-[11px] text-slate-400">Use <code className="bg-slate-100 px-1 rounded text-[10px]">[subject]</code> or <code className="bg-slate-100 px-1 rounded text-[10px]">[name]</code> as smart tags.</p>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="New Inquiry: [subject]" className={field} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">From Name</Label>
                <p className="text-[11px] text-slate-400">Display name shown to recipients.</p>
                <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Tanzeem-e-Islami" className={field} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">From Email</Label>
                <p className="text-[11px] text-slate-400">Must match the SMTP authenticated sender address.</p>
                <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="no-reply@yourdomain.com" type="email" className={field} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reply-To</Label>
                <p className="text-[11px] text-slate-400">When admin clicks Reply, email goes here. Leave blank to use submitter's address.</p>
                <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="info@yourdomain.com" type="email" className={cn(field, "md:max-w-md")} />
              </div>
            </div>
          </div>



          {/* ── Success Message ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <SectionHeader
              icon={CheckCircle}
              title="Success Message"
              description="Shown to the user immediately after a successful form submission."
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Success Heading</Label>
                <Input
                  value={successHeading}
                  onChange={(e) => setSuccessHeading(e.target.value)}
                  placeholder="Message Sent Successfully!"
                  className={field}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Success Description</Label>
                <Input
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                  placeholder="Thank you for contacting us. We'll respond within 24-48 hours."
                  className={field}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
});
