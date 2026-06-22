"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Settings2,
  ExternalLink,
  Layout,
  Users,
  Save,
  Loader2,
  GripVertical,
  Edit2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ImageUploader } from "../ImageUploader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Platform {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  themeColor: string;
  order: number;
  isActive: boolean;
}

interface Account {
  id: string;
  platformId: string;
  title: string;
  url: string;
  imageUrl: string;
  buttonText: string;
  order: number;
  isActive: boolean;
}

export function SocialMediaManager() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activePlatformId, setActivePlatformId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [platformDialogOpen, setPlatformDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Partial<Platform>>({});
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [platformsRes, accountsRes] = await Promise.all([
        fetch("/api/social-media/platforms"),
        fetch("/api/social-media/accounts")
      ]);

      if (platformsRes.ok && accountsRes.ok) {
        const platformsData = await platformsRes.json();
        const accountsData = await accountsRes.json();
        setPlatforms(platformsData.platforms || []);
        setAccounts(accountsData.accounts || []);

        if (platformsData.platforms?.length > 0 && !activePlatformId) {
          setActivePlatformId(platformsData.platforms[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load social media data."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlatform = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/social-media/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: [currentPlatform] })
      });

      if (!res.ok) throw new Error("Failed to save platform");

      toast({ title: "Success", description: "Platform saved successfully." });
      setPlatformDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const [deletingPlatformId, setDeletingPlatformId] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleDeletePlatform = async (id: string) => {
    setDeletingPlatformId(null);
    try {
      const res = await fetch("/api/social-media/platforms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Platform removed." });
        fetchData();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
    }
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      const payload = { ...currentAccount, platformId: activePlatformId };
      const res = await fetch("/api/social-media/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: [payload] })
      });

      if (!res.ok) throw new Error("Failed to save account");

      toast({ title: "Success", description: "Account saved." });
      setAccountDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setDeletingAccountId(null);
    try {
      const res = await fetch("/api/social-media/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Account removed." });
        fetchData();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
    }
  };

  const filteredAccounts = accounts.filter(a => a.platformId === activePlatformId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Synchronizing social ecosytem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Social Media Hub</h1>
          <p className="text-muted-foreground mt-2">Orchestrate your cross-platform digital presence and engagement links.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={platformDialogOpen} onOpenChange={setPlatformDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setCurrentPlatform({ isActive: true, order: platforms.length })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Platform
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentPlatform.id ? "Edit Platform" : "Add New Platform"}</DialogTitle>
                <DialogDescription>Define a social platform for your community to connect on.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Platform Name</Label>
                  <Input
                    id="name"
                    value={currentPlatform.name || ""}
                    onChange={(e) => setCurrentPlatform({ ...currentPlatform, name: e.target.value })}
                    placeholder="e.g. YouTube, Instagram"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug (Unique Identifier)</Label>
                  <Input
                    id="slug"
                    value={currentPlatform.slug || ""}
                    onChange={(e) => setCurrentPlatform({ ...currentPlatform, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. youtube"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Platform Icon</Label>
                  <ImageUploader
                    value={currentPlatform.iconUrl || ""}
                    onChange={(url) => setCurrentPlatform({ ...currentPlatform, iconUrl: url })}
                    aspectRatio={1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Theme Color (Hex)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      value={currentPlatform.themeColor || "#0d5844"}
                      onChange={(e) => setCurrentPlatform({ ...currentPlatform, themeColor: e.target.value })}
                      className="flex-1"
                    />
                    <div
                      className="w-10 h-10 rounded-md border border-border"
                      style={{ backgroundColor: currentPlatform.themeColor || "#0d5844" }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPlatformDialogOpen(false)}>Cancel</Button>
                <ConfirmDialog
                  title="Save Platform"
                  description="Are you sure you want to save this social media platform?"
                  onConfirm={handleSavePlatform}
                >
                  <Button disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Platform
                  </Button>
                </ConfirmDialog>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Platforms Sidebar/List */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" /> Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex flex-col gap-1">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatformId(p.id)}
                    className={cn(
                      "flex items-center justify-between py-3 rounded-xl text-left transition-all duration-200 group",
                      activePlatformId === p.id
                        ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.themeColor }}
                      />
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-inherit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPlatform(p);
                          setPlatformDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-inherit hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPlatformId(p.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Area */}
        <div className="lg:col-span-9 space-y-6">
          {activePlatformId ? (
            <Card className="border-border/50 shadow-2xl bg-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-6">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    {platforms.find(p => p.id === activePlatformId)?.name} Accounts
                  </CardTitle>
                  <CardDescription>Accounts and links appearing in the {platforms.find(p => p.id === activePlatformId)?.name} tab.</CardDescription>
                </div>
                <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setCurrentAccount({ isActive: true, order: filteredAccounts.length, buttonText: "Follow" })}
                      className="rounded-full shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{currentAccount.id ? "Edit Account" : "Add New Account"}</DialogTitle>
                      <DialogDescription>Add a specific handle or channel for this platform.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Account/Channel Title</Label>
                        <Input
                          id="title"
                          value={currentAccount.title || ""}
                          onChange={(e) => setCurrentAccount({ ...currentAccount, title: e.target.value })}
                          placeholder="e.g. Dr. Israr Ahmed Official"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="url">Direct URL</Label>
                        <Input
                          id="url"
                          value={currentAccount.url || ""}
                          onChange={(e) => setCurrentAccount({ ...currentAccount, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="img">Account Avatar / Image</Label>
                        <ImageUploader
                          value={currentAccount.imageUrl || ""}
                          onChange={(url) => setCurrentAccount({ ...currentAccount, imageUrl: url })}
                          aspectRatio={1}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="btn">Button Text</Label>
                          <Input
                            id="btn"
                            value={currentAccount.buttonText || ""}
                            onChange={(e) => setCurrentAccount({ ...currentAccount, buttonText: e.target.value })}
                            placeholder="Follow, Subscribe, Visit..."
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="order">Sort Order</Label>
                          <Input
                            id="order"
                            type="number"
                            value={currentAccount.order || 0}
                            onChange={(e) => setCurrentAccount({ ...currentAccount, order: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>Cancel</Button>
                      <ConfirmDialog
                        title="Save Account"
                        description="Are you sure you want to save this social media account details?"
                        onConfirm={handleSaveAccount}
                      >
                        <Button disabled={isSaving}>
                          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save Account
                        </Button>
                      </ConfirmDialog>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-8">
                {filteredAccounts.length === 0 ? (
                  <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                    <p className="text-muted-foreground">No accounts found for this platform. Start by adding one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="group relative bg-muted/30 border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={account.imageUrl || "https://img.icons8.com/color/96/user.png"}
                              alt={account.title}
                              className="w-14 h-14 rounded-full object-cover border-2 border-primary/10 group-hover:scale-110 transition-transform"
                            />
                            {account.isActive && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{account.title}</h4>
                            <p className="text-xs text-muted-foreground truncate mb-3">{account.url}</p>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{account.buttonText}</Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 rounded-lg"
                            onClick={() => {
                              setCurrentAccount(account);
                              setAccountDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 rounded-lg"
                            onClick={() => setDeletingAccountId(account.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-border rounded-3xl">
              <p className="text-muted-foreground">Select a platform from the sidebar to manage accounts.</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!deletingPlatformId}
        onOpenChange={(open) => !open && setDeletingPlatformId(null)}
        title="Delete Platform"
        description="Are you sure you want to delete this platform? This will NOT delete associated accounts but they will have no platform assigned."
        onConfirm={() => deletingPlatformId && handleDeletePlatform(deletingPlatformId)}
      />

      <ConfirmDialog
        open={!!deletingAccountId}
        onOpenChange={(open) => !open && setDeletingAccountId(null)}
        title="Delete Account"
        description="Are you sure you want to remove this social media account?"
        onConfirm={() => deletingAccountId && handleDeleteAccount(deletingAccountId)}
      />
    </div>
  );
}
