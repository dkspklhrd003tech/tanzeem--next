"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Shield, User as UserIcon, X, Eye, EyeOff, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";

type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
};

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "editor",
        isActive: true,
    });
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const generatePassword = () => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setFormData(prev => ({ ...prev, password: retVal }));
        setShowPassword(true);
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to load users", error);
            toast({
                title: "Error",
                description: "Failed to load users.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name || "",
                email: user.email,
                password: "", // Don't populate password
                role: user.role,
                isActive: user.isActive,
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "editor",
                isActive: true,
            });
        }
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const isEditing = !!editingUser;
            const url = isEditing ? `/api/users/${editingUser.id}` : "/api/users";
            const method = isEditing ? "PUT" : "POST";

            const payload: any = { ...formData };
            if (isEditing && !payload.password) {
                delete payload.password; // Don't send empty password down on edit
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save user");

            toast({
                title: "Success!",
                description: `User successfully ${isEditing ? "updated" : "added"}.`,
            });

            closeModal();
            fetchUsers();
        } catch (error: any) {
            toast({
                title: "Operation Failed",
                description: error.message || "Failed to save user.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const [deletingUser, setDeletingUser] = useState<{ id: string, name: string | null } | null>(null);

    const handleDelete = async (id: string, name: string | null) => {
        setDeletingUser(null);

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete user");

            toast({
                title: "User Deleted",
                description: "The user has been permanently removed.",
            });

            fetchUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete user.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-foreground-muted">Manage administrators and restricted editors</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {isLoading && users.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-pulse space-y-4 w-full">
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                        <div className="h-12 bg-muted rounded-lg w-full"></div>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-foreground-muted text-sm border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Joined</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{user.name || "Unnamed User"}</div>
                                                    <div className="text-sm text-foreground-muted">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className={`w-4 h-4 ${user.role === 'admin' ? 'text-primary' : 'text-foreground-light'}`} />
                                                <span className="capitalize text-sm font-medium">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.isActive ? "default" : "secondary"}>
                                                {user.isActive ? "Active" : "Disabled"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground-muted">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-foreground-light hover:text-primary transition-colors hover:bg-primary/10 rounded-md"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingUser({ id: user.id, name: user.name })}
                                                    className="p-2 text-foreground-light hover:text-destructive transition-colors hover:bg-destructive/10 rounded-md"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-foreground-muted">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cinematic 3D Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateX: 45, y: 50, z: -100 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, z: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotateX: -45, y: -20, z: -100 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
                            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                                <h2 className="text-xl font-bold text-foreground">
                                    {editingUser ? "Edit User" : "Add New User"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-foreground-muted hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form id="user-form" onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="e.g. Abdullah Khan"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="user@tanzeem.org"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-foreground">
                                            Password {editingUser && <span className="text-foreground-muted font-normal">(Leave blank to keep unchanged)</span>}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium"
                                        >
                                            <KeyRound className="w-3 h-3" />
                                            Auto-generate
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-3 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-foreground">Role Assignment</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="editor">Restricted Editor</option>
                                            <option value="admin">Full Admin</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-foreground">Account Status</label>
                                        <select
                                            value={formData.isActive ? "true" : "false"}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="true">Active (Allowed)</option>
                                            <option value="false">Disabled (Suspended)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="py-2 hover:bg-muted text-foreground-muted hover:text-foreground rounded-lg transition-colors font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <ConfirmDialog
                                        title={editingUser ? "Update User" : "Create User"}
                                        description={`Are you sure you want to ${editingUser ? "update" : "create"} this user account?`}
                                        onConfirm={() => document.getElementById("user-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                                    >
                                        <Button
                                            type="button"
                                            disabled={isLoading}
                                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-50"
                                        >
                                            {isLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
                                        </Button>
                                    </ConfirmDialog>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmDialog
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                title="Delete User"
                description={`Are you sure you want to permanently delete ${deletingUser?.name || 'this user'}? This action cannot be undone.`}
                onConfirm={() => deletingUser && handleDelete(deletingUser.id, deletingUser.name)}
            />
        </div>
    );
}
