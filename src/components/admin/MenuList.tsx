"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, XCircle, ArrowLeft, Save, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
    id: string;
    label: string;
    url: string;
    parentId: string | null;
    order: number;
    isOpenInNew: boolean;
    isVisible: boolean;
    menuType: string;
    children?: MenuItem[];
}

export function MenuList() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [flatMenus, setFlatMenus] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingMenu, setEditingMenu] = useState<Partial<MenuItem> | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const fetchMenus = async () => {
        setIsLoading(true);
        try {
            const responseTree = await fetch("/api/menus?hierarchy=true");
            const dataTree = await responseTree.json();
            setMenus(dataTree.menus || []);

            const responseFlat = await fetch("/api/menus");
            const dataFlat = await responseFlat.json();
            setFlatMenus(dataFlat.menus || []);
        } catch (error) {
            console.error("Failed to fetch menus", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const handleSave = async () => {
        try {
            const isNew = !editingMenu?.id;
            const url = isNew ? "/api/menus" : `/api/menus/${editingMenu.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingMenu),
            });

            if (!res.ok) throw new Error("Failed to save menu");

            toast({
                title: "Success",
                description: `Menu item ${isNew ? "created" : "updated"} successfully.`,
            });
            setEditingMenu(null);
            fetchMenus();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save menu item",
            });
        }
    };

    const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeletingMenuId(null);

        try {
            const res = await fetch(`/api/menus/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete menu");

            toast({
                title: "Success",
                description: "Menu item deleted successfully.",
            });
            fetchMenus();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete menu item",
            });
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    if (editingMenu) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setEditingMenu(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {editingMenu.id ? "Edit Menu Item" : "Create Menu Item"}
                            </h1>
                        </div>
                    </div>
                    <ConfirmDialog
                        title={editingMenu.id ? "Update Menu Item" : "Create Menu Item"}
                        description={`Are you sure you want to ${editingMenu.id ? "update" : "create"} this navigation link?`}
                        onConfirm={handleSave}
                    >
                        <Button className="bg-primary text-white">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </ConfirmDialog>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <Label>Label</Label>
                            <Input
                                value={editingMenu.label || ""}
                                onChange={(e) => setEditingMenu({ ...editingMenu, label: e.target.value })}
                                placeholder="e.g. About Us"
                            />
                        </div>
                        <div>
                            <Label>URL</Label>
                            <Input
                                value={editingMenu.url || ""}
                                onChange={(e) => setEditingMenu({ ...editingMenu, url: e.target.value })}
                                placeholder="e.g. /about or https://example.com"
                            />
                        </div>
                        <div>
                            <Label>Parent Item (for nested dropdowns)</Label>
                            <Select
                                value={editingMenu.parentId || "none"}
                                onValueChange={(v) => setEditingMenu({ ...editingMenu, parentId: v === "none" ? null : v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="No Parent (Top Level)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Parent (Top Level)</SelectItem>
                                    {flatMenus
                                        .filter((m) => m.id !== editingMenu.id) // Can't be parent of itself
                                        .map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Order (Position)</Label>
                            <Input
                                type="number"
                                value={editingMenu.order || 0}
                                onChange={(e) => setEditingMenu({ ...editingMenu, order: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <Label>Visible</Label>
                            <Switch
                                checked={editingMenu.isVisible !== false}
                                onCheckedChange={(c) => setEditingMenu({ ...editingMenu, isVisible: c })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    const renderMenuRows = (items: MenuItem[], depth = 0) => {
        return items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.has(item.id);
            const levelBg = depth === 0 
              ? "bg-white text-slate-900 font-bold border-l-4 border-l-primary" 
              : depth === 1 
              ? "bg-primary/30 text-slate-900 font-semibold border-l-4 border-l-emerald-600" 
              : "bg-blue-200 text-slate-900 font-semibold border-l-4 border-l-blue-600";

            return (
                <React.Fragment key={item.id}>
                    <TableRow className={cn("hover:bg-muted/60 transition-colors", levelBg)}>
                        <TableCell>
                            <div
                                className="flex items-center"
                                style={{ paddingLeft: `${depth * 24}px` }}
                            >
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="p-1 hover:bg-muted rounded-md mr-1"
                                    >
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>
                                ) : (
                                    <div className="w-6 mr-1" />
                                )}
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-foreground-muted">{item.url}</TableCell>
                        <TableCell>{item.order}</TableCell>
                        <TableCell>
                            <div className={cn("w-2 h-2 rounded-full", item.isVisible ? "bg-primary" : "bg-red-500")} />
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setEditingMenu(item)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeletingMenuId(item.id)} className="text-red-500">
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    {hasChildren && isExpanded && renderMenuRows(item.children!, depth + 1)}
                </React.Fragment>
            );
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Menus</h1>
                    <p className="text-foreground-muted">Manage website navigation menus</p>
                </div>
                <Button onClick={() => setEditingMenu({ label: "", url: "", order: 0, isVisible: true })} className="bg-primary text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Label</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-foreground-muted">
                                        Loading menus...
                                    </TableCell>
                                </TableRow>
                            ) : menus.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-foreground-muted">
                                        No menus found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                renderMenuRows(menus)
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ConfirmDialog
                open={!!deletingMenuId}
                onOpenChange={(open) => !open && setDeletingMenuId(null)}
                title="Delete Menu Item"
                description="Are you sure you want to remove this navigation link? Sub-items will also be affected if they depend on this parent."
                onConfirm={() => {
                    if (deletingMenuId) handleDelete(deletingMenuId);
                }}
            />
        </motion.div>
    );
}
