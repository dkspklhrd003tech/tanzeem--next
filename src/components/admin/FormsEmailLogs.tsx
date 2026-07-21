"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";


export function FormsEmailLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you might want to fetch email-logs and join with forms
      const res = await fetch("/api/admin/email-logs");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || "Failed to fetch");
      }
      const data = await res.json();
      setLogs(data.items || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to load email logs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">

      <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-border py-6 px-6">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" /> Email Delivery Logs
            </CardTitle>
            <p className="text-sm text-foreground-muted mt-1 uppercase tracking-wider font-semibold">
              Real-time tracking of form notification emails
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="py-4 px-8 font-bold text-xs tracking-wider text-slate-500 uppercase">Date & Time</TableHead>
                <TableHead className="py-4 px-8 font-bold text-xs tracking-wider text-slate-500 uppercase">Form ID</TableHead>
                <TableHead className="py-4 px-8 font-bold text-xs tracking-wider text-slate-500 uppercase">Status</TableHead>
                <TableHead className="py-4 px-8 font-bold text-xs tracking-wider text-slate-500 uppercase">Sent To</TableHead>
                <TableHead className="py-4 px-8 font-bold text-xs tracking-wider text-slate-500 uppercase">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    No email logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 px-8 font-medium text-slate-600">
                      {format(new Date(log.createdAt), "MMM d, yyyy, h:mm a")}
                    </TableCell>
                    <TableCell className="py-4 px-8 text-foreground font-medium">
                      {log.formId}
                    </TableCell>
                    <TableCell className="py-4 px-8">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wider">
                          <CheckCircle className="w-3.5 h-3.5" /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold tracking-wider">
                          <XCircle className="w-3.5 h-3.5" /> FAILED
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-8 text-slate-600">
                      {log.sentTo}
                    </TableCell>
                    <TableCell className="py-4 px-8 text-slate-400 text-sm">
                      {log.details || "Delivered via SMTP"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
