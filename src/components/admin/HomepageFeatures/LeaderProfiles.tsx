"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "../ImageUploader";
import { RichTextEditor } from "../RichTextEditor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type TeamMember = {
    id: string;
    name: string;
    designation: string | null;
    bio: string | null;
    avatar: string | null;
    order: number;
    isActive: boolean;
};

export function LeaderProfiles() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        bio: "",
        avatar: "",
        order: 0,
        isActive: true,
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await fetch("/api/team");
            if (res.ok) {
                const data = await res.json();
                setTeam(data.teamMembers || []);
            }
        } catch (error) {
            console.error("Failed to load team members", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                designation: member.designation || "",
                bio: member.bio || "",
                avatar: member.avatar || "",
                order: member.order,
                isActive: member.isActive,
            });
        } else {
            setEditingMember(null);
            setFormData({
                name: "",
                designation: "",
                bio: "",
                avatar: "",
                order: team.length,
                isActive: true,
            });
        }
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
        setPreviewUrl(null);
    };

    // Removed handleFileUpload as we use ImageUploader now

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const isEditing = !!editingMember;
            const url = isEditing ? `/api/team/${editingMember.id}` : "/api/team";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save profile");

            toast({
                title: "Success!",
                description: `Profile successfully ${isEditing ? "updated" : "added"}.`,
            });

            closeModal();
            fetchTeam();
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const [deletingLeader, setDeletingLeader] = useState<{id: string, name: string} | null>(null);

    const handleDelete = async (id: string, name: string) => {
        setDeletingLeader(null);

        try {
            const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete profile");
            toast({ title: "Profile Deleted", description: "The profile has been removed." });
            fetchTeam();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Leadership Profiles</h2>
                    <p className="text-sm text-foreground-muted mt-1">Manage Founder, Ameer, and Other Prominent Organizational Figures.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:bg-primary-dark active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Global Leader
                </button>
            </div>

            {isLoading && team.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-pulse space-y-4 w-full">
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-foreground font-semibold text-xs uppercase tracking-wider border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Identity</th>
                                    <th className="px-6 py-4">Profile & Mandate</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {team.map((member) => (
                                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 w-32">
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border border-border relative">
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-6 h-6" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground text-lg">{member.name}</div>
                                            <div className="text-primary text-sm font-medium uppercase tracking-wide">{member.designation}</div>
                                            {member.bio && (
                                                <div className="text-sm text-foreground-muted mt-1 max-w-sm line-clamp-2">{member.bio}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-foreground-muted">{member.order}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={member.isActive ? "default" : "secondary"} className={member.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                                                {member.isActive ? "Active" : "Hidden"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(member)} className="p-2 text-foreground-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(member.id, member.name)} className="p-2 text-foreground-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {team.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                            No profiles found. Click "Add Profile" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                                <h3 className="text-xl font-bold text-foreground">
                                    {editingMember ? "Edit Profile" : "Add New Profile"}
                                </h3>
                                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground-muted hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form id="profileForm" onSubmit={handleSave} className="space-y-6">

                                    <div className="flex items-start gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Avatar *</label>
                                            <ImageUploader
                                                value={formData.avatar}
                                                onChange={(url) => setFormData({ ...formData, avatar: url })}
                                                aspectRatio={1}
                                            />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="Dr. Israr Ahmed"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">Official Designation</label>
                                                <input
                                                    type="text"
                                                    value={formData.designation}
                                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                                    className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="The Founder"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Biography Synopsis</label>
                                        <RichTextEditor
                                            content={formData.bio}
                                            onChange={(content) => setFormData({ ...formData, bio: content })}
                                            placeholder="Write a brief biographical profile..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Sort Order</label>
                                            <input
                                                type="number"
                                                value={formData.order}
                                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-center pt-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    />
                                                    <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-muted border border-border'}`}></div>
                                                    <div className={`absolute left-1 top-1 bg-[#fefefc] w-6 h-6 rounded-full transition-transform ${formData.isActive ? 'translate-x-6 shadow-sm' : ''}`}></div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">Active Status</div>
                                                    <div className="text-xs text-foreground-muted">{formData.isActive ? 'Visible' : 'Hidden'}</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end gap-3 sticky bottom-0">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-all active:scale-95">
                                    Cancel
                                </button>
                                <ConfirmDialog
                                    title={editingMember ? "Update Profile" : "Create Profile"}
                                    description={`Are you sure you want to ${editingMember ? "update" : "create"} this leadership profile?`}
                                    onConfirm={() => document.getElementById("profileForm")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                                >
                                    <button type="button" disabled={isLoading || isUploading} className="px-8 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary-dark transition-all active:scale-95 shadow-sm hover:shadow-md min-w-[140px]">
                                        {isLoading ? <div className="mx-auto w-5 h-5 border-2 border-white/30 border-t-[#fefefc] rounded-full animate-spin"></div> : "Save Global Profile"}
                                    </button>
                                </ConfirmDialog>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmDialog
                open={!!deletingLeader}
                onOpenChange={(open) => !open && setDeletingLeader(null)}
                title="Delete Leader Profile"
                description={`Are you sure you want to permanently delete the profile of "${deletingLeader?.name}"?`}
                onConfirm={() => deletingLeader && handleDelete(deletingLeader.id, deletingLeader.name)}
            />
        </div>
    );
}
