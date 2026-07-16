"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Loader2, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


export const FormsEmailConfigs = forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [sendToEmail, setSendToEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const emailSettings = data.settings?.form_email || {};

          if (emailSettings.sendToEmail) setSendToEmail(emailSettings.sendToEmail);
          if (emailSettings.emailSubject) setEmailSubject(emailSettings.emailSubject);
          if (emailSettings.fromName) setFromName(emailSettings.fromName);
          if (emailSettings.fromEmail) setFromEmail(emailSettings.fromEmail);
          if (emailSettings.replyTo) setReplyTo(emailSettings.replyTo);
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
    setIsSaving(true);
    try {
      const payload = {
        group: "form_email",
        settings: {
          sendToEmail,
          emailSubject,
          fromName,
          fromEmail,
          replyTo,
        },
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Success", description: "Email configurations saved." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not save configuration.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">


      <div className="mb-6">
        <p className="text-sm text-slate-500 leading-relaxed max-w-4xl">
          Admin notifications go to Send To below (all forms). Refer a Friend also emails the friend&apos;s address from the form.
          Each form uses its own Email Subject Line from the envelope icon settings.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8 mt-8 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Email Configurations</h3>
          </div>

          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-foreground">Send To Email Address <span className="text-slate-400 font-normal ml-1">ⓘ</span></Label>
                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors">
                      <Tag className="w-3 h-3" /> SHOW SMART TAGS
                    </button>
                  </div>
                  <Input
                    value={sendToEmail}
                    onChange={(e) => setSendToEmail(e.target.value)}
                    placeholder="info@yourdomain.com"
                    className="h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-foreground">Email Subject Line</Label>
                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors">
                      <Tag className="w-3 h-3" /> SHOW SMART TAGS
                    </button>
                  </div>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="[form_name]"
                    className="h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-foreground">From Name</Label>
                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors">
                      <Tag className="w-3 h-3" /> SHOW SMART TAGS
                    </button>
                  </div>
                  <Input
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Your Company Name"
                    className="h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-foreground">From Email <span className="text-slate-400 font-normal ml-1">ⓘ</span></Label>
                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors">
                      <Tag className="w-3 h-3" /> SHOW SMART TAGS
                    </button>
                  </div>
                  <Input
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="no-reply@yourdomain.com"
                    className="h-12 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-foreground">Reply-To <span className="text-slate-400 font-normal ml-1">ⓘ</span></Label>
                  <button className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors">
                    <Tag className="w-3 h-3" /> SHOW SMART TAGS
                  </button>
                </div>
                <Input
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="no-reply@yourdomain.com"
                  className="h-12 bg-slate-50/50 border-slate-200 rounded-xl w-full"
                />
              </div>
            </div>
          </div>
      )}
    </div>
  );
});
