"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Menu,
  Image,
  Headphones,
  Video,
  BookOpen,
  BookMarked,
  Newspaper,
  HelpCircle,
  Mail,
  Send,
  Users,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  User,
  KeyRound,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  MapPin,
  GalleryHorizontal,
  Heart,
  Megaphone,
  Share2,
  Home,
  Mic,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


// ─── Types ────────────────────────────────────────────────────────────────────
import { AdminUser, AuthContext } from "@/hooks/use-admin-auth";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
  subItems?: { title: string; href: string }[];
}



// ─── Navigation Items ─────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/sitemanager/dashboard", icon: LayoutDashboard },
  {
    title: "Audios",
    icon: Headphones,
    subItems: [
      { title: "Audios By Speaker", href: "/sitemanager/pages/audios-by-speaker/edit" },
      { title: "Audios By Category", href: "/sitemanager/pages/audios-by-category/edit" },
    ],
  },
  {
    title: "Videos",
    icon: Video,
    subItems: [
      { title: "Videos By Speakers", href: "/sitemanager/pages/videos-by-speakers/edit" },
      { title: "Videos By Category", href: "/sitemanager/pages/videos-by-category/edit" },
    ],
  },
  {
    title: "Books",
    icon: BookOpen,
    subItems: [
      { title: "Audio Books", href: "/sitemanager/pages/audio-books/edit" },
      { title: "Books By Category", href: "/sitemanager/pages/books-by-category/edit" },
    ],
  },
  {
    title: "Magazines",
    icon: Newspaper,
    subItems: [
      { title: "Meesaq", href: "/sitemanager/pages/meesaq/edit" },
      { title: "Hikmat-e-Quran", href: "/sitemanager/pages/hikmat-e-quran/edit" },
      { title: "Nida-e-Khilafat", href: "/sitemanager/pages/nida-e-khilafat/edit" },
      { title: "Perspective", href: "/sitemanager/pages/perspective/edit" },
    ],
  },
  { title: "Press Releases", href: "/sitemanager/pages/press-releases/edit", icon: FileText },
  { title: "Khitab-e-Jum'ah (Audio)", href: "/sitemanager/pages/khitab-e-jumah-audio/edit", icon: Headphones },
  { title: "Pages", href: "/sitemanager/pages", icon: FileText },
  // ── Content ──────────────────────────────────────────────────────────────
  { title: "Jummah Venues", href: "/sitemanager/khitabat-addresses", icon: MapPin },
  { title: "Sermons", href: "/sitemanager/sermons", icon: Mic },
  // ── System ───────────────────────────────────────────────────────────────
  { title: "Tanzeem Settings", href: "/sitemanager/settings", icon: Settings },
  { title: "Activity Log", href: "/sitemanager/activity", icon: History, superAdminOnly: true },
];

// ─── Breadcrumb helper ────────────────────────────────────────────────────────

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  isCollapsed,
}: {
  item: NavItem;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = item.href
    ? (item.href === "/sitemanager/dashboard"
      ? pathname === "/sitemanager/dashboard"
      : pathname === item.href || pathname.startsWith(item.href + "/"))
    : !!item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"));

  const [isOpen, setIsOpen] = useState(isActive);

  if (item.subItems) {
    const btnContent = (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-150",
          isActive
            ? "bg-primary text-white shadow-sm"
            : isOpen
              ? "bg-primary/80 text-white"
              : "text-sidebar-foreground hover:bg-primary/80 hover:text-white active:text-white focus:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", (isActive || isOpen) ? "text-white" : "text-sidebar-foreground group-hover:text-white group-active:text-white")} />
          {!isCollapsed && <span className="truncate text-sm font-medium">{item.title}</span>}
        </div>
        {!isCollapsed && <ChevronLeft className={cn("h-4 w-4 transition-transform", isOpen ? "-rotate-90" : "")} />}
      </button>
    );

    return (
      <div className="space-y-1">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{btnContent}</TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ) : btnContent}

        {!isCollapsed && isOpen && (
          <ul className="mt-1 ml-4 space-y-1 border-l border-sidebar-border/50">
            {item.subItems.map((sub) => {
              const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
              return (
                <li key={sub.href}>
                  <Link
                    href={sub.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors ml-2",
                      isSubActive
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground hover:bg-primary/50 hover:text-white"
                    )}
                  >
                    {sub.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  const linkContent = (
    <Link
      href={item.href!}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
        isActive
          ? "bg-primary text-white shadow-sm"
          : "text-sidebar-foreground hover:bg-primary/80 hover:text-white active:text-white active:bg-primary/80 focus:text-white"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive
            ? "text-white"
            : "text-sidebar-foreground group-hover:text-white group-active:text-white"
        )}
      />

      {!isCollapsed && (
        <span className="truncate text-sm font-medium">
          {item.title}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  isCollapsed,
  isMobileOpen,
  onCollapse,
  onMobileClose,
  user,
  onLogout,
}: {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCollapse: () => void;
  onMobileClose: () => void;
  user: AdminUser | null;
  onLogout: () => void;
}) {
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "SUPER_ADMIN";
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col",
          "bg-sidebar border-r border-sidebar-border shadow-sm",
          // On mobile: slide in/out as overlay
          "max-md:transition-transform max-md:duration-300",
          isMobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-sidebar-border shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-bold text-lg leading-none">ت</span>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-sidebar-foreground">Tanzeem</p>
                  <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wide">Site Manager</p>
                </div>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto"
              >
                <span className="text-primary-foreground font-bold text-lg leading-none">ت</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1 rounded text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-0.5">
              {visibleItems.map((item) => (
                <li key={item.title}>
                  <SidebarNavItem item={item} isCollapsed={isCollapsed} />
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>

        {/* User section + collapse toggle */}
        <div className="border-t border-sidebar-border p-2 shrink-0 space-y-1">
          {/* Collapse toggle — desktop only */}
          <button
            onClick={onCollapse}
            className={cn(
              "hidden md:flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60",
              "hover:bg-primary/10 hover:text-primary transition-colors"
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg",
                  "hover:bg-primary/10 transition-colors group"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {user?.avatar && <AvatarImage src={user.avatar} alt={user.name ?? ""} />}
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-xs font-semibold text-sidebar-foreground truncate">
                      {user?.name ?? user?.email ?? "Admin"}
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/50 capitalize truncate">
                      {user?.role?.replace("_", " ") ?? ""}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/sitemanager/profile">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sitemanager/change-password">
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Top Header ───────────────────────────────────────────────────────────────

function TopHeader({
  isSidebarCollapsed,
  onMobileMenuOpen,
  user,
  onLogout,
}: {
  isSidebarCollapsed: boolean;
  onMobileMenuOpen: () => void;
  user: AdminUser | null;
  onLogout: () => void;
}) {
  const breadcrumbs = useBreadcrumbs();
  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shrink-0">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              {crumb.isLast ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: search, notifications, user */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-2">
          {/* Search — hidden on mobile */}
          <div className="relative hidden lg:block">
            <input
              type="search"
              placeholder="Search..."
              className={cn(
                "h-8 pl-8 pr-4 w-40 rounded-lg text-sm bg-muted border border-border",
                "text-muted-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              )}
            />
          </div>

          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-1 h-1 bg-red-500 rounded-full" />
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  {user?.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user?.name ?? "Admin"}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground rotate-90 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/sitemanager/profile">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sitemanager/change-password">
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </header>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function SiteManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);


  // Load current user — redirect to login if not authenticated
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          // Not authenticated — redirect to login preserving the intended URL
          const callbackUrl = encodeURIComponent(pathname);
          router.replace(`/sitemanager/login?callbackUrl=${callbackUrl}`);
          return null;
        }
        return r.json();
      })
      .then((data) => setUser(data?.user ?? null))
      .catch(() => {
        router.replace("/sitemanager/login");
        setUser(null);
      })
      .finally(() => setIsUserLoading(false));
  }, [pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sitemanager/login");
  };

  // The login page lives under /sitemanager/login — render it bare (no admin chrome)
  const isLoginPage = pathname === "/sitemanager/login";
  if (isLoginPage) {
    return (
      <AuthContext.Provider value={{ user, isLoading: isUserLoading }}>
        {children}
      </AuthContext.Provider>
    );
  }

  const isDark = false; // Forced Light Mode

  return (
    <AuthContext.Provider value={{ user, isLoading: isUserLoading }}>
      <div
        className={cn(
          "min-h-screen sitemanager-admin-layout relative overflow-hidden",
          isDark
            ? "dark bg-slate-950 text-slate-100"
            : "admin-light bg-slate-100 text-slate-900"
        )}
      >
        {/* Ambient decorative glowing spots — subdued in light mode */}
        <div className={cn("absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[140px] pointer-events-none", isDark ? "bg-[#0d5844]/8" : "bg-[#0d5844]/5")} />
        <div className={cn("absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[140px] pointer-events-none", isDark ? "bg-indigo-950/25" : "bg-slate-300/40")} />

        <Suspense fallback={null}>
          <Sidebar
            isCollapsed={isCollapsed}
            isMobileOpen={isMobileOpen}
            onCollapse={() => setIsCollapsed((c) => !c)}
            onMobileClose={() => setIsMobileOpen(false)}
            user={user}
            onLogout={handleLogout}
          />
        </Suspense>

        {/* Main area — offset by sidebar width */}
        <motion.div
          initial={false}
          animate={{ marginLeft: isCollapsed ? 72 : 260 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-col min-h-screen max-md:!ml-0 relative z-10"
        >
          <TopHeader
            isSidebarCollapsed={isCollapsed}
            onMobileMenuOpen={() => setIsMobileOpen(true)}
            user={user}
            onLogout={handleLogout}
          />

          {/* Page content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </motion.div>
      </div>
    </AuthContext.Provider>
  );
}
