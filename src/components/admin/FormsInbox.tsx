"use client";

import { useState, useEffect } from "react";
import { Mail, CheckCircle2, Loader2, Inbox, Trash2, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


export function FormsInbox() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.message || "Failed to fetch");
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load inbox", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const unreadIds = submissions.filter(s => !s.isRead).map(s => s.id);
      if (unreadIds.length === 0) return;

      await Promise.all(unreadIds.map(id =>
        fetch("/api/contact", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isRead: true })
        })
      ));

      setSubmissions(prev => prev.map(sub => ({ ...sub, isRead: true })));
      toast({ title: "Success", description: "All submissions marked as read." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to mark as read.", variant: "destructive" });
    }
  };

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !currentStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");

      setSubmissions(prev => prev.map(sub =>
        sub.id === id ? { ...sub, isRead: !currentStatus } : sub
      ));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update submission status.", variant: "destructive" });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/contact?id=${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");

      setSubmissions(prev => prev.filter(sub => sub.id !== deleteId));
      toast({ title: "Success", description: "Message deleted permanently." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete message.", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === "UNREAD") return !sub.isRead;
    return true;
  });

  return (
    <div className="space-y-6">

      <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4 px-6 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">Submission Queue</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-slate-500 hover:text-primary transition-colors tracking-widest uppercase"
            >
              Mark All Read
            </button>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setFilter("ALL")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition-all",
                  filter === "ALL" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-foreground"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter("UNREAD")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition-all",
                  filter === "UNREAD" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-foreground"
                )}
              >
                Unread
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Inbox className="w-12 h-12 mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-600 mb-1">Inbox Zero!</h3>
              <p className="text-sm">No submissions match your filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleToggleRead(sub.id, sub.isRead)}
                  className={cn(
                    "p-6 transition-colors hover:bg-primary-light/40 cursor-pointer relative group",
                    !sub.isRead && "bg-primary-light/40"
                  )}>
                  {!sub.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">
                        {sub.email || sub.name || "Anonymous"}
                      </h4>
                      {!sub.isRead && <span className="w-2.5 h-2.5 animate-pulse rounded-full bg-primary" />}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1">
                        {format(new Date(sub.createdAt), "MMMM dd, yyyy")}
                      </span>
                      <button
                        onClick={(e) => handleDeleteClick(e, sub.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 p-1"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-md text-foreground/80 mb-3 line-clamp-2 leading-relaxed">
                    {sub.message || "No message provided."}
                  </p>

                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-light/80 text-primary text-xs font-bold uppercase tracking-wider">
                    {sub.formType || sub.formId || "Unknown Form"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Are you sure to Delete this Message?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-primary text-primary hover:bg-primary hover:text-white flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white hover:text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
