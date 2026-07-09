"use client";

import { useState, useEffect } from "react";
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
  Globe,
  Navigation,
  Box,
  Hash,
  MapPin,
  Image as ImageIcon,
  Download,
  Heart,
  HelpCircle,
  Share2,
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


const menuItems: any[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/sitemanager",
  },
  {
    title: "Pages",
    icon: FileText,
    items: [
      {
        title: "All Pages",
        icon: FileText,
        href: "/sitemanager/pages",
      },
      {
        title: "Policy",
        icon: FileText,
        href: "/sitemanager/pages/policy",
      }
    ]
  },
  {
    title: "SEO / Meta",
    icon: Hash,
    href: "/sitemanager?section=seo",
  },
  {
    title: "Content",
    icon: Newspaper,
    items: [
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
        icon: Newspaper,
        href: "/sitemanager?section=magazines",
      },
      {
        title: "Press Releases",
        icon: FileText,
        href: "/sitemanager?section=press-releases",
      },
      {
        title: "Team / Speakers",
        icon: Users,
        href: "/sitemanager?section=team",
      },
    ],
  },
  {
    title: "Programs",
    icon: Calendar,
    items: [
      {
        title: "Quranic Circles",
        icon: MapPin,
        href: "/sitemanager?section=locations",
      },
      {
        title: "Campaigns",
        icon: Mic,
        href: "/sitemanager?section=campaigns",
      },
    ],
  },
  {
    title: "Audios",
    icon: Headphones,
    items: [
      {
        title: "Audios By Speaker",
        icon: Mic,
        href: "/sitemanager?section=audios-by-speaker",
      },
      {
        title: "Audios By Category",
        icon: Folder,
        href: "/sitemanager?section=audios-by-category",
      },
      {
        title: "Audio Books",
        icon: BookOpen,
        href: "/sitemanager?section=audio-books",
      },
    ],
  },
  {
    title: "Global Settings",
    icon: Settings,
    items: [
      {
        title: "Site Identity",
        icon: Globe,
        href: "/sitemanager?section=identity",
      },
      {
        title: "Navigation",
        icon: Navigation,
        href: "/sitemanager/header",
      },
      {
        title: "Footer",
        icon: ListOrdered,
        href: "/sitemanager/footer",
      },
      {
        title: "Components",
        icon: Box,
        items: [
          {
            title: "Page Banner",
            icon: FileText,
            href: "/sitemanager?section=banner",
          },
        ],
      },
    ],
  },
  {
    title: "Additional Tools",
    icon: Box,
    items: [
      {
        title: "Galleries",
        icon: ImageIcon,
        href: "/sitemanager?section=galleries",
      },
      {
        title: "Downloads",
        icon: Download,
        href: "/sitemanager?section=downloads",
      },
      {
        title: "Donations",
        icon: Heart,
        href: "/sitemanager?section=donations",
      },
      {
        title: "FAQs",
        icon: HelpCircle,
        href: "/sitemanager?section=faqs",
      },
      {
        title: "Users",
        icon: Users,
        href: "/sitemanager?section=users",
      },
      {
        title: "Social Media",
        icon: Share2,
        href: "/sitemanager?section=social-media",
      },
    ],
  }
];

function SidebarMenuItem({ item, currentSection, isCollapsed, level = 0 }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = item.href?.includes(`section=${currentSection}`) ||
    (currentSection === "dashboard" && item.href === "/sitemanager");
  const hasItems = item.items && item.items.length > 0;

  // Auto-expand if a child is active
  useEffect(() => {
    if (hasItems && item.items.some((i: any) => i.href?.includes(`section=${currentSection}`))) {
      setIsOpen(true);
    }
  }, [currentSection, hasItems, item.items]);

  const content = (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground-muted hover:text-primary hover:bg-muted/50",
      level > 0 && "py-1.5 text-sm"
    )}>
      <item.icon className={cn("h-5 w-5 shrink-0", level > 0 && "h-4 w-4")} />
      {!isCollapsed && (
        <span className="flex-1 whitespace-nowrap overflow-hidden">
          {item.title}
        </span>
      )}
      {!isCollapsed && hasItems && (
        <ChevronLeft className={cn(
          "h-4 w-4 transition-transform",
          isOpen ? "-rotate-90" : ""
        )} />
      )}
    </div>
  );

  return (
    <li>
      {item.href ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href}>{content}</Link>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
        </Tooltip>
      ) : (
        <div onClick={() => setIsOpen(!isOpen)}>{content}</div>
      )}

      {!isCollapsed && hasItems && isOpen && (
        <ul className="mt-1 ml-4 space-y-1 border-l border-border">
          {item.items.map((subItem: any) => (
            <SidebarMenuItem
              key={subItem.title}
              item={subItem}
              currentSection={currentSection}
              isCollapsed={isCollapsed}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onExitAdmin: () => void;
}

export function AdminLayout({ children, currentSection, onExitAdmin }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
        <div className="h-16 px-2 flex items-center justify-between border-b border-border">
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
              {menuItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  item={item}
                  currentSection={currentSection}
                  isCollapsed={isSidebarCollapsed}
                />
              ))}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Exit Admin Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
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
          isSidebarCollapsed ? "ml-20" : "ml-[20px]"
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
