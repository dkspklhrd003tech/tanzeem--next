import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mail, Save, Loader2, Code, MonitorPlay, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry: Contact Us Form</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="padding: 0; margin: 0; font-family: Helvetica, Arial, sans-serif; background: #f0f0f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #f0f0f0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!--[if mso]>
        <table border="0" cellspacing="0" cellpadding="0" width="500"><tr><td>
        <![endif]-->
        <table border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">
          <tr>
            <td align="center" style="padding: 20px; border-bottom: 1px solid #eee; background: white;">
              <img src="https://tanzeem.org/tanzeem-logo.webp" alt="Tanzeem-e-Islami" style="max-width: 180px; height: auto; display: inline-block; outline: none; border: none;">
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px;">
              <h3 style="margin-top: 0; color: #333; font-family: 'Outfit', Helvetica, Arial, sans-serif;">New Contact Submission</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 130px; color: #555;">Full Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #222;">[name]</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email Address:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #3b82f6;">[email]</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Phone Number:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #222;">[phone]</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #222;">[subject]</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Message:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #222;">[msg]</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="background: #f9fafb; padding: 15px; color: #0d5844; font-size: 12px;">
              &copy; 2026 Tanzeem.org. All Rights Reserved.
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;

export const FormsEmailTemplate = forwardRef((props, ref) => {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    save: saveTemplate
  }));

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const emailSettings = data.settings?.contact || {};
          if (emailSettings.email_template_html) {
            setTemplate(emailSettings.email_template_html);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const saveTemplate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { email_template_html: template },
          group: "contact"
        }),
      });

      if (!res.ok) throw new Error("Failed to save template");

      toast({
        title: "Success",
        description: "Email template saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Email Template Configuration</h3>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Column */}
          <div className="rounded-xl border border-primary-light/30 shadow-sm overflow-hidden bg-foreground flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-light/40">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">HTML Editor</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
                onClick={(e) => { e.preventDefault(); setTemplate(DEFAULT_TEMPLATE); }}
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reset to Default
              </Button>
            </div>
            <div className="flex-1 p-0 relative">
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                spellCheck="false"
                className="absolute inset-0 w-full h-full bg-transparent text-slate-300 font-mono text-[13px] leading-relaxed p-6 resize-none focus:outline-none"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>

          {/* Preview Column */}
          <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white flex flex-col min-h-[600px]">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <MonitorPlay className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Real-Time Preview</span>
            </div>
            <div className="flex-1 bg-slate-50/50 p-6 flex flex-col">
              <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                <iframe
                  srcDoc={template}
                  title="Email Template Preview"
                  className="absolute inset-0 w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
});
