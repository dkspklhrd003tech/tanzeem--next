"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Mail, X, ClipboardList, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";
import { FormsTopNav } from "./FormsTopNav";

export function FormsManager() {
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const { toast } = useToast();

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/admin/forms");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setForms(data.items || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load forms.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreate = async () => {
    if (!newFormName.trim()) return;
    setIsCreating(true);
    try {
      const slug = newFormName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFormName, slug, isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast({ title: "Success", description: "Form created successfully." });
      setNewFormName("");
      fetchForms();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not create form.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Success", description: "Form deleted." });
      fetchForms();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not delete form.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <FormsTopNav
        rightElement={
          <>
            <div className="relative w-full sm:w-[250px]">
              <Input
                placeholder="Search forms..."
                className="w-full bg-slate-50 border-slate-100 pl-10 rounded-xl shadow-inner"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="New form name..."
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                className="w-[180px] bg-white rounded-xl hidden md:flex"
              />
              <Button onClick={handleCreate} disabled={!newFormName.trim() || isCreating} className="bg-primary hover:bg-primary/90 text-white shadow-md rounded-full px-6 py-5 font-bold tracking-wider text-xs">
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                CREATE NEW FORM
              </Button>
            </div>
          </>
        }
      />

      {/* Forms Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-20 text-foreground-muted bg-card rounded-2xl border border-border shadow-sm">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold mb-2">No Forms Created</h3>
          <p>Create a new form to start collecting submissions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      <ClipboardList className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/sitemanager/forms/${form.id}/builder`}>
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-100">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/sitemanager/forms/${form.id}/email`}>
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </Link>
                      <ConfirmDialog
                        title="Delete Form"
                        description={`Are you sure you want to delete "${form.name}"? This will also delete all submissions and fields.`}
                        onConfirm={() => handleDelete(form.id)}
                      >
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm">
                          <X className="w-5 h-5" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-800 tracking-tight">{form.name}</h3>
                    <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">/{form.slug}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">STRUCTURE</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">X FIELDS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">INBOX</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700">X UNREAD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">SENT / READ</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">X DONE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">LAST MODIFIED</span>
                      <span className="text-xs font-bold text-foreground">
                        {form.updatedAt ? format(new Date(form.updatedAt), "MM/dd/yyyy") : "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
