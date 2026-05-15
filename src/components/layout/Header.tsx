"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChevronDown, Youtube, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const WP_NAVIGATION = [
  { name: "Home", href: "/" },
  {
    name: "Organization",
    href: "/organization",
    children: [
      { name: "Background", href: "/organization/background" },
      { name: "Mission Statement", href: "/organization/mission-statement" },
      {
        name: "Our Ideology",
        href: "/organization/our-ideology",
        children: [
          { name: "Basic Belief", href: "/organization/our-ideology/basic-belief" },
          { name: "Our Obligations", href: "/organization/our-ideology/our-obligations" },
          { name: "Methodology", href: "/organization/our-ideology/methodology" },
          { name: "Foundation", href: "/organization/our-ideology/foundation" }
        ]
      },
      { name: "The Founder", href: "/organization/the-founder" },
      { name: "The Ameer", href: "/organization/the-ameer" }
    ]
  },
  {
    name: "Education",
    href: "#",
    children: [
      { name: "Ruju Ilal Quran", href: "/markaz-tanzeem" },
      { name: "Distance Learning", href: "/distance-learning" },
      { name: "Online Courses", href: "https://lms.quranacademy.com" }
    ]
  },
  {
    name: "Resources",
    href: "#",
    children: [
      {
        name: "Audios",
        href: "/audio-2",
        children: [
          { name: "By Speaker", href: "/audios/audios-by-category-2" },
          { name: "Audios By Category", href: "/audios/audios-by-category" },
          { name: "Audio Books", href: "/audio-books" }
        ]
      },
      {
        name: "Videos",
        href: "/videos",
        children: [
          {
            name: "Videos By Category",
            href: "/videos-by-category",
          },
          {
            name: "Videos By Speakers",
            href: "/videos-by-speakers",
          },
          { name: "Dr. Israr Ahmad Lectures", href: "https://www.youtube.com/@DrIsrarRA" },
          { name: "Dr. Israr Ahmad (Q&A)", href: "https://www.youtube.com/@AskDrIsrar" },
          { name: "Bayan ul Quran", href: "https://www.youtube.com/@BiyanulQuran" },
          { name: "Muntakhab Nisab", href: "https://www.youtube.com/@MuntakhabNisab" },
          { name: "Dr. Israr Ahmad (Video Clips)", href: "https://www.youtube.com/@DrIsrarAhmed_Official" }
        ]
      },
      {
        name: "Books",
        href: "/books",
        children: [
          { name: "Audio Books", href: "/audio-books" },
          { name: "Books By Authors", href: "/books_author-dr-israr-ahmed/by-authors" },
          { name: "Books by Category", href: "/books-by-category" }
        ]
      },
      {
        name: "Magazines",
        href: "/magazines",
        children: [
          { name: "Meesaq", href: "/meesaq" },
          { name: "Hikmat-e-Quran", href: "/hikmat-e-quran" },
          { name: "Nida-e-Khilafat", href: "/nida-e-khilafat" }
        ]
      },
      { name: "Press Releases", href: "/press-releases" },
      { name: "Social Media", href: "/social-media" },
      { name: "Khitab-e-Jum’ah (Audio)", href: "/category-audio-code-002-mutfariq-khutbat-e-jumah" },
      { name: "FAQ’S", href: "/faq" }
    ]
  },
  { name: "Quranic Circles", href: "/quranic-circles" },
  { name: "Contact Us", href: "/contact-us" }
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await fetch("/api/menus?hierarchy=true&visibleOnly=true");
        if (res.ok) {
          const data = await res.json();
          if (data.menus && data.menus.length > 0) {
            // Map DB keys to the component's expected keys
            const mapItems = (items: any[]) => items.map(item => ({
              name: item.label,
              href: item.url,
              children: item.children?.length ? mapItems(item.children) : undefined,
            }));
            setNavigation(mapItems(data.menus));
          } else {
            setNavigation(WP_NAVIGATION);
          }
        } else {
          setNavigation(WP_NAVIGATION);
        }
      } catch (error) {
        console.error("Failed to load navigation", error);
        setNavigation(WP_NAVIGATION);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          // Flatten grouped settings into simple map for fast access
          const flatSettings: Record<string, string> = {};
          Object.values(data.settings).forEach((group: any) => {
            Object.entries(group).forEach(([k, v]) => {
              flatSettings[k] = v as string;
            });
          });
          setSettings(flatSettings);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    fetchNavigation();
    fetchSettings();
  }, []);

  return (
    <>
      {/* Top Social Bar */}
      <div className="bg-[#f8f9fa] border-b border-border text-foreground py-2 hidden md:block">
        <div className="container mx-auto flex justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-foreground/60 font-medium text-xs">Follow Us:</span>
              <a href={settings.youtube_url || "https://youtube.com/@tanzeemeislami"} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[#fefefc] hover:bg-red-700 transition-colors shadow-sm">
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a href={settings.facebook_url || "https://facebook.com/tanzeemeislami"} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[#fefefc] hover:bg-blue-700 transition-colors shadow-sm">
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a href={settings.twitter_url || "https://twitter.com/tanzeemeislami"} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[#fefefc] hover:bg-gray-800 transition-colors shadow-sm">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href={settings.whatsapp_url || "https://wa.me/+924235869501"} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-[#fefefc] hover:bg-green-600 transition-colors shadow-sm">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 bg-[#fefefc] border-b border-border",
          isScrolled && "shadow-md"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {settings.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="Tanzeem-e-Islami"
                  className="h-10 md:h-14 w-auto object-contain transition-transform"
                />
              ) : (
                <>
                  <div className="relative w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                    <span className="text-[#fefefc] font-bold text-lg md:text-xl">ت</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg md:text-xl font-bold" style={{ color: '#005031' }}>
                      Tanzeem<span style={{ color: '#c8a84e' }}>-e-</span>Islami
                    </h1>
                    <p className="text-[10px] text-foreground-muted -mt-0.5" style={{ fontFamily: "'Scheherazade New', serif" }}>
                      تنظیمِ اسلامی
                    </p>
                  </div>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0 z-[100]">
              {navigation.map((item) => (
                <DesktopMenuItem key={item.name} item={item} />
              ))}
              {/* Search */}
              <Input
                placeholder="Search..."
                className="w-64 h-8 pl-3 pr-9 rounded-full border-border bg-[#fefefc] text-xs"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            </nav>

            {/* Mobile Search & Menu */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      {settings.site_logo ? (
                        <img
                          src={settings.site_logo}
                          alt="Logo"
                          className="h-8 w-auto object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-[#fefefc] font-bold">ت</span>
                        </div>
                      )}
                      <span style={{ color: '#005031' }}>Tanzeem-e-Islami</span>
                    </SheetTitle>
                  </SheetHeader>
                  <MobileNavigation navigation={navigation} onClose={() => setIsMobileMenuOpen(false)} />
                  <div className="mt-8">
                    <Link
                      href="https://app.dhtr.org/contactus"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center py-3 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary-hover transition-all"
                    >
                      JOIN TANZEEM
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div >
      </motion.header >

      {/* Search Modal (Mobile) */}
      <AnimatePresence>
        {
          isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                  <Input placeholder="Search..." className="pl-12 h-14 text-lg bg-[#fefefc] rounded-xl" autoFocus />
                  <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}

function DesktopMenuItem({ item, depth = 0 }: { item: any; depth?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const isTopLevel = depth === 0;

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        href={item.href}
        className={cn(
          "transition-colors",
          isTopLevel
            ? "py-2 px-4 text-md font-medium text-foreground hover:text-[#0d5844]"
            : "block px-5 py-2.5 text-sm text-foreground hover:bg-primary hover:text-[#fefefc] border-b border-border/30 last:border-0"
        )}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div
      className={cn("relative z-[100]", !isTopLevel && "w-full")}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {isTopLevel ? (
        <button className="flex items-center gap-1 py-2 px-4 text-foreground hover:text-primary transition-colors text-md font-medium">
          {item.name}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
      ) : (
        <button className="flex w-full items-center justify-between px-5 py-2.5 text-md text-foreground hover:bg-primary hover:text-[#fefefc] transition-colors border-b border-border/30 last:border-0 group">
          {item.name}
          <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-foreground-muted group-hover:text-white" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, [isTopLevel ? "y" : "x"]: isTopLevel ? 6 : -6 }}
            animate={{ opacity: 1, [isTopLevel ? "y" : "x"]: 0 }}
            exit={{ opacity: 0, [isTopLevel ? "y" : "x"]: isTopLevel ? 6 : -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bg-[#fefefc] shadow-xl border border-border min-w-[220px] z-[120]",
              isTopLevel ? "top-full left-0 rounded-b-lg" : "top-0 left-full rounded-lg ml-0.5"
            )}
          >
            {item.children.map((child: any) => (
              <DesktopMenuItem key={child.name} item={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({ item, onClose, depth = 0 }: { item: any, onClose: () => void, depth?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "block py-3 font-medium hover:text-primary transition-colors",
          depth === 0 ? "px-4" : "text-sm text-foreground-muted"
        )}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full py-3 text-left font-medium transition-colors hover:text-primary",
          depth === 0 ? "px-4" : "text-sm text-foreground-muted"
        )}
      >
        {item.name}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 border-l border-border/50 ml-4 mb-2"
          >
            {item.children.map((child: any) => (
              <MobileNavItem key={child.name} item={child} onClose={onClose} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavigation({ navigation, onClose }: { navigation: any[], onClose: () => void }) {
  return (
    <nav className="mt-6">
      <div className="space-y-0.5">
        {navigation.map((item) => (
          <MobileNavItem key={item.name} item={item} onClose={onClose} />
        ))}
      </div>
    </nav>
  );
}
