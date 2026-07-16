"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, Loader2, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";


export function FormsHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Fetch from the contact submissions API
      const res = await fetch("/api/contact");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || "Failed to fetch");
      }
      const data = await res.json();

      // Filter for replied/sent messages
      const sent = (data.submissions || []).filter((sub: any) => sub.isReplied);
      setHistory(sent);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">

      <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border py-6 px-8">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Sent / Read History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Inbox className="w-12 h-12 mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600 mb-1">No History</h3>
              <p className="text-sm">You haven't sent any replies yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((sub) => (
                <div key={sub.id} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900 uppercase">
                        {sub.name || "Anonymous"}
                      </h4>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{sub.email || "No email"}</p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                      {sub.formType || sub.formId || "Unknown Form"}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    {sub.repliedAt ? format(new Date(sub.repliedAt), "M/d/yyyy") : format(new Date(sub.createdAt), "M/d/yyyy")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
