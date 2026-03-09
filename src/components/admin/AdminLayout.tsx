"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Headphones,
  Video,
  BookOpen,
  Users,
  Calendar,
  Settings,
  ChevronLeft,
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Moon,
  Sun,
  Folder,
  MessageSquare,
  Newspaper,
  Mic,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/sitemanager",
  },
  {
    title: "Homepage Setup",
    icon: LayoutDashboard,
    href: "/sitemanager?section=homepage",
  },
  {
    title: "Dars-e-Quran",
    icon: BookOpen,
    href: "/sitemanager?section=darse-quran",
  },
  {
    title: "Pages",
    icon: FileText,
    href: "/sitemanager?section=pages",
  },
  {
    title: "Menus",
    icon: ListOrdered,
    href: "/sitemanager?section=menus",
  },
  {
    title: "Posts",
    icon: Newspaper,
    href: "/sitemanager?section=posts",
  },
  {
    title: "Audio",
    icon: Headphones,
    href: "/sitemanager?section=audio",
  },
  {
    title: "Videos",
    icon: Video,
    href: "/sitemanager?section=videos",
  },
  {
    title: "Books",
    icon: BookOpen,
    href: "/sitemanager?section=books",
  },
  {
    title: "Magazines",
    icon: Folder,
    href: "/sitemanager?section=magazines",
  },
  {
    title: "Sermons",
    icon: Mic,
    href: "/sitemanager?section=sermons",
  },
  {
    title: "Events",
    icon: Calendar,
    href: "/sitemanager?section=events",
  },
  {
    title: "Team",
    icon: Users,
    href: "/sitemanager?section=team",
  },
  {
    title: "Testimonials",
    icon: MessageSquare,
    href: "/sitemanager?section=testimonials",
  },
  {
    title: "Users",
    icon: Users,
    href: "/sitemanager?section=users",
  },
  {
    title: "Media Library",
    icon: Folder,
    href: "/sitemanager?section=media",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/sitemanager?section=settings",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onExitAdmin: () => void;
}

export function AdminLayout({ children, currentSection, onExitAdmin }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">ت</span>
                </div>
                <span className="font-bold text-foreground">Admin Panel</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="shrink-0"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              isSidebarCollapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = item.href.includes(`section=${currentSection}`) ||
                  (currentSection === "dashboard" && item.href === "/sitemanager");

                return (
                  <li key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground-muted hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <AnimatePresence mode="wait">
                            {!isSidebarCollapsed && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="whitespace-nowrap overflow-hidden"
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Link>
                      </TooltipTrigger>
                      {isSidebarCollapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Exit Admin Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={onExitAdmin}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isSidebarCollapsed && "Exit Admin"}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "ml-20" : "ml-[280px]"
        )}
      >
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-medium">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExitAdmin}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
