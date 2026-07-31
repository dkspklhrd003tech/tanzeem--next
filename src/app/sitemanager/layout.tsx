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
import { cn, resolveMediaUrl } from "@/lib/utils";
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
  { title: "Pages", href: "/sitemanager/pages", icon: Home },
  // ── Content ──────────────────────────────────────────────────────────────
  { title: "Events", href: "/sitemanager/pages/events/edit", icon: Calendar },
  { title: "Jummah Venues", href: "/sitemanager/khitabat-addresses", icon: MapPin },
  { title: "Sermons / Khitab-e-Jum'ah (Audio)", href: "/sitemanager/sermons", icon: Mic },
  // ── System ───────────────────────────────────────────────────────────────
  { title: "Settings", href: "/sitemanager/settings", icon: Settings },
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

  // Find all possible hrefs to check for more specific matches
  const allHrefs = NAV_ITEMS.flatMap(i => [i.href, ...(i.subItems?.map(s => s.href) || [])]).filter(Boolean) as string[];

  const isExactMatch = item.href ? pathname === item.href : false;
  const isPrefixMatch = item.href ? pathname.startsWith(item.href + "/") : false;

  // If there's another matching href that is longer, it's a more specific match
  const hasMoreSpecificMatch = item.href ? allHrefs.some(href =>
    href !== item.href && pathname.startsWith(href) && href.length > item.href!.length
  ) : false;

  const isActive = item.href
    ? (item.href === "/sitemanager/dashboard"
      ? pathname === "/sitemanager/dashboard"
      : (isExactMatch || (isPrefixMatch && !hasMoreSpecificMatch)))
    : !!item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"));

  const [isOpen, setIsOpen] = useState(isActive);

  // When Collapsed and has subItems -> Flyout Dropdown Menu on the right
  if (isCollapsed && item.subItems) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "group relative flex h-9 w-9 mx-auto items-center justify-center rounded-lg transition-all duration-150 outline-none",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
            <span className={cn("absolute top-1 right-1 w-1.5 h-1.5 rounded-full", isActive ? "bg-white" : "bg-primary/80")} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-52 p-1.5 shadow-xl border border-border bg-card">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
            {item.title}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.subItems.map((sub) => {
            const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
            return (
              <DropdownMenuItem key={sub.href} asChild>
                <Link
                  href={sub.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                    isSubActive ? "bg-primary text-white font-semibold shadow-sm" : "hover:bg-primary/10 text-foreground"
                  )}
                >
                  <span>{sub.title}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // When Collapsed and simple link -> Tooltip icon button
  if (isCollapsed && item.href) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "group flex h-9 w-9 mx-auto items-center justify-center rounded-lg transition-all duration-150",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-semibold text-xs bg-popover text-popover-foreground border shadow-md">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (item.subItems) {
    const btnContent = (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-150",
          isActive
            ? "bg-primary text-white shadow-sm font-semibold"
            : isOpen
              ? "bg-primary/80 text-white font-medium"
              : "text-sidebar-foreground hover:bg-primary/80 hover:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", (isActive || isOpen) ? "text-white" : "text-sidebar-foreground group-hover:text-white")} />
          <span className="truncate text-sm font-medium">{item.title}</span>
        </div>
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "-rotate-90" : "")} />
      </button>
    );

    return (
      <div className="space-y-1">
        {btnContent}
        {isOpen && (
          <ul className="mt-1 ml-4 space-y-1 border-l-2 border-sidebar-border/60 pl-2">
            {item.subItems.map((sub) => {
              const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
              return (
                <li key={sub.href}>
                  <Link
                    href={sub.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-xs transition-colors",
                      isSubActive
                        ? "bg-primary text-white font-semibold shadow-sm"
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

  return (
    <Link
      href={item.href!}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
        isActive
          ? "bg-primary text-white font-semibold shadow-sm"
          : "text-sidebar-foreground hover:bg-primary/80 hover:text-white"
      )}
    >
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-white" : "text-sidebar-foreground group-hover:text-white"
        )}
      />
      <span className="truncate text-sm font-medium">{item.title}</span>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  isCollapsed,
  isMobileOpen,
  onCollapse,
  onMobileClose,
  user,
  siteLogo,
  onLogout,
}: {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCollapse: () => void;
  onMobileClose: () => void;
  user: AdminUser | null;
  siteLogo?: string;
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
        animate={{ width: isCollapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col overflow-x-hidden",
          "bg-primary-light border-r border-sidebar-border shadow-sm",
          "max-md:transition-transform max-md:duration-300",
          isMobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                {siteLogo ? (
                  <img src={resolveMediaUrl(siteLogo)} alt="Site Logo" className="max-h-8 max-w-[120px] w-auto h-auto object-contain shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-primary-foreground font-bold text-base leading-none">ت</span>
                  </div>
                )}
                <div className="leading-tight">
                  <p className="text-sm font-bold text-sidebar-foreground">Tanzeem</p>
                  <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wide">Site Manager</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm font-bold text-base">
                  ت
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-full text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-1.5 scrollbar-none overflow-x-hidden">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1">
              {visibleItems.map((item) => (
                <li key={item.title}>
                  <SidebarNavItem item={item} isCollapsed={isCollapsed} />
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>

        {/* User section + collapse toggle */}
        <div className="border-t border-sidebar-border p-1.5 shrink-0 space-y-1">
          {/* Collapse toggle — desktop only */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCollapse}
                  className={cn(
                    "hidden md:flex items-center transition-colors text-sidebar-foreground/60 hover:bg-primary/10 hover:text-primary",
                    isCollapsed
                      ? "w-9 h-9 mx-auto justify-center rounded-lg"
                      : "w-full gap-2 px-3 py-2 rounded-lg text-xs"
                  )}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <>
                      <PanelLeftClose className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Collapse</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Expand Sidebar</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          {/* User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center transition-all duration-150 group outline-none",
                  isCollapsed
                    ? "w-9 h-9 mx-auto justify-center rounded-lg hover:bg-primary/10"
                    : "gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-primary/10"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {user?.avatar && <AvatarImage src={resolveMediaUrl(user.avatar)} alt={user.name ?? ""} />}
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
            <DropdownMenuContent side="right" align="end" className="w-52 shadow-xl border border-border">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/sitemanager/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/sitemanager/change-password" className="cursor-pointer">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
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
          className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
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
                  className="text-muted-foreground transition-colors"
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

          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-1 h-1 bg-red-500 rounded-full" />
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors">
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
  const [siteLogo, setSiteLogo] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/settings?group=general")
      .then(res => res.json())
      .then(data => {
        if (data.settings?.general?.site_logo) {
          const rawLogo = data.settings.general.site_logo;
          setSiteLogo(resolveMediaUrl(rawLogo));
        }
      })
      .catch(err => console.error("Failed to load identity settings:", err));
  }, []);


  // Load current user — redirect to login if not authenticated
  useEffect(() => {
    // If we're already on the login page, don't check auth or trigger redirects
    if (pathname === "/sitemanager/login") {
      setIsUserLoading(false);
      return;
    }

    // Only fetch once when the layout mounts
    if (user && !isUserLoading) return;

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
            : "admin-light bg-slate-100 text-foreground"
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
            siteLogo={siteLogo}
            onLogout={handleLogout}
          />
        </Suspense>

        {/* Main area — offset by sidebar width */}
        <motion.div
          initial={false}
          animate={{ marginLeft: isCollapsed ? 72 : 260 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="min-h-screen flex flex-col max-md:!ml-0 relative z-10"
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
