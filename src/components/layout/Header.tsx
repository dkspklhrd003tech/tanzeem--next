"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { resolveMenuLink, EXTERNAL_LINK_REL } from "@/lib/security";
import { useSettings } from "@/hooks/use-settings";
import { useNavigation, type MenuNode } from "@/hooks/use-navigation";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayDate, setDisplayDate] = useState<{ greg: string; hijri: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Single shared source of truth for nav + settings (SWR-deduped across components).
  const { items: navigation, isLoading: navLoading } = useNavigation("main", true);
  const { settings } = useSettings();
  const rawLogoSrc = (settings.header_logo && settings.header_logo !== "null" && settings.header_logo !== "undefined" && settings.header_logo.trim() !== "")
    ? settings.header_logo
    : "/tanzeem-logo.webp";

  const logoSrc = resolveMediaUrl(rawLogoSrc);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!settings || Object.keys(settings).length === 0) return;

    if (settings.date_display_mode === "manual") {
      const manual = settings.manual_date_text || "";
      const parts = manual.split("&");
      setDisplayDate({
        greg: parts[0]?.trim() || manual,
        hijri: parts[1]?.trim() || "",
      });
      return;
    }

    try {
      const offset = parseInt(settings.hijri_offset || "0", 10) || 0;

      const gregDate = new Date();
      const gregStr = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(gregDate);

      const hijriDate = new Date();
      hijriDate.setDate(hijriDate.getDate() + offset);

      const hijriParts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).formatToParts(hijriDate);

      let hijriDay = '';
      let hijriMonthNum = '';
      let hijriYear = '';

      for (const part of hijriParts) {
        if (part.type === 'day') hijriDay = part.value;
        if (part.type === 'month') hijriMonthNum = part.value;
        if (part.type === 'year') hijriYear = part.value;
      }

      // Urdu names for Hijri months
      const hijriMonthNamesUr = [
        "محرم",
        "صفر",
        "ربیع الاول",
        "ربیع الثانی",
        "جمادی الاول",
        "جمادی الثانی",
        "رجب",
        "شعبان",
        "رمضان",
        "شوال",
        "ذوالقعدہ",
        "ذوالحجہ"
      ];

      // Convert Western digits to Urdu-Indic numerals
      const toUrduNumerals = (n: string) =>
        n.replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

      const monthIdx = parseInt(hijriMonthNum, 10) - 1;
      const hijriMonthName = hijriMonthNamesUr[monthIdx] || "ذوالحجہ";
      const hijriStr = `${hijriMonthName} ${toUrduNumerals(hijriDay)}، ${toUrduNumerals(hijriYear)}`;

      setDisplayDate({ greg: gregStr, hijri: hijriStr });
    } catch (error) {
      console.error("Error formatting dates:", error);
    }
  }, [settings]);

  return (
    <>
      {/* Skip to main content link — keyboard-first (WCAG 2.4.1) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg">
        Skip to main content
      </a>

      {/* Top Social Bar */}
      {mounted && (
        <div className="bg-primary border-b border-border text-secondary py-2 hidden md:block">
          <div className="container mx-auto flex justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-6">
              {/* Social links are driven entirely by settings — no hardcoded fallbacks. */}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel={EXTERNAL_LINK_REL} aria-label="YouTube — opens in new tab" className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-primary-foreground hover:bg-red-700 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel={EXTERNAL_LINK_REL} aria-label="Facebook — opens in new tab" className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-primary-foreground hover:bg-blue-700 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel={EXTERNAL_LINK_REL} aria-label="X (Twitter) — opens in new tab" className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-primary-foreground hover:bg-gray-800 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              )}
              {settings.whatsapp_url && (
                <a href={settings.whatsapp_url} target="_blank" rel={EXTERNAL_LINK_REL} aria-label="WhatsApp — opens in new tab" className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-primary-foreground hover:bg-green-600 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
              )}
            </div>
            {settings.header_show_date !== "false" && displayDate && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white border border-primary/20 px-3 py-1 rounded-full shadow-sm">
                <span className="ltr">{displayDate.greg}</span>
                <span className="text-secondary mx-0.5">&amp;</span>
                <span
                  className="font-nastaleeq text-[16px] leading-none"
                  style={{ fontFamily: "'Jameel Noori Nastaleeq', serif" }}
                  dir="rtl"
                  lang="ur"
                >
                  {displayDate.hijri}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 px-4 bg-card border-b border-border",
          isScrolled && "shadow-md"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto !p-0">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {mounted && logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Tanzeem-e-Islami"
                  className="h-10 md:h-14 w-[95px] md:w-auto object-contain transition-transform"
                />
              ) : (
                <>
                  <div className="relative w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                    <span className="text-[#fefefc] font-bold text-lg md:text-xl">ت</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg md:text-xl font-bold text-primary">
                      Tanzeem<span className="text-accent-gold">-e-</span>Islami
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
              {!mounted || navLoading ? (
                <div className="flex items-center gap-3 px-4">
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-14 rounded bg-muted animate-pulse" />
                </div>
              ) : (
                <>
                  {navigation.map((item) => (
                    <DesktopMenuItem key={item.id} item={item} />
                  ))}
                  {/* Search */}
                  {settings.header_show_search !== "false" && (
                    <form onSubmit={handleSearchSubmit} className="relative ml-4 flex items-center">
                      <Input
                        type="search"
                        placeholder="Search..."
                        aria-label="Search the site"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 h-8 pl-3 pr-9 rounded-full border-border bg-card text-xs"
                      />
                      <button type="submit" aria-label="Submit search" className="absolute right-1 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors p-2 rounded-full">
                        <Search className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </form>
                  )}
                </>
              )}
            </nav>

            {/* Mobile Search & Menu */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              {mounted && settings.header_show_search !== "false" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="lg:hidden"
                  aria-label="Open search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

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
                      {mounted && logoSrc ? (
                        <img
                          src={logoSrc}
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
                  {mounted && settings.header_cta_text && (
                    <div className="mt-6 px-4">
                      <Button asChild className="w-full bg-[#005031] hover:bg-[#004026] text-white rounded-full">
                        <Link href={settings.header_cta_url || "/join"} onClick={() => setIsMobileMenuOpen(false)}>
                          {settings.header_cta_text}
                        </Link>
                      </Button>
                    </div>
                  )}
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
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32 px-6"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    aria-label="Search the site"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-12 h-14 text-lg bg-card rounded-xl"
                    autoFocus
                  />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}

function getMenuItemClass(isTopLevel: boolean, isActive: boolean = false) {
  return cn(
    "transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
    isTopLevel
      ? cn("flex items-center gap-1 py-2 px-3 text-[13px] font-medium hover:text-primary", isActive ? "text-primary" : "text-[#222222]")
      : cn("flex w-full items-center justify-between px-5 py-2.5 text-[13px] hover:bg-primary hover:text-primary-foreground border-b border-border/30 last:border-0 group", isActive ? "text-primary bg-primary/5" : "text-[#222222]")
  );
}

function DesktopMenuItem({ item, depth = 0 }: { item: MenuNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isTopLevel = depth === 0;

  const { href, isExternal, isOpenInNew } = resolveMenuLink(item.url, item.isOpenInNew);
  const isActive = !!href && pathname === href;
  const className = getMenuItemClass(isTopLevel, isActive);

  if (!item.children || item.children.length === 0) {
    if (!href) return null; // unsafe/sanitized away

    if (isExternal) {
      return (
        <a href={href} target={isOpenInNew ? "_blank" : undefined} rel={EXTERNAL_LINK_REL} className={className}>
          {item.label}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className={cn("relative z-[100]", !isTopLevel && "w-full")}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {item.url ? (
        // Parent has its own URL → render as a link with a dropdown caret.
        (() => {
          if (!href) return null;
          const sharedProps = {
            "aria-haspopup": true as const,
            "aria-expanded": isOpen,
            className,
          };
          return isExternal ? (
            <a href={href} target={isOpenInNew ? "_blank" : undefined} rel={EXTERNAL_LINK_REL} {...sharedProps}>
              {item.label}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
            </a>
          ) : (
            <Link href={href} {...sharedProps}>
              {item.label}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
            </Link>
          );
        })()
      ) : (
        <button
          aria-haspopup="true"
          aria-expanded={isOpen}
          className={className}
        >
          {item.label}
          {isTopLevel ? (
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-foreground-muted group-hover:text-primary-foreground" aria-hidden="true" />
          )}
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
            {item.children.map((child) => (
              <DesktopMenuItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({ item, onClose, depth = 0 }: { item: MenuNode, onClose: () => void, depth?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const { href, isExternal, isOpenInNew } = resolveMenuLink(item.url, item.isOpenInNew);
  const isActive = !!href && pathname === href;

  if (!item.children || item.children.length === 0) {
    if (!href) return null;

    const className = cn(
      "block py-3 font-medium hover:text-primary transition-colors",
      depth === 0 ? "px-4" : "text-sm",
      isActive ? "text-primary" : (depth === 0 ? "text-foreground" : "text-foreground-muted")
    );
    if (isExternal) {
      return (
        <a href={href} target={isOpenInNew ? "_blank" : undefined} rel={EXTERNAL_LINK_REL} onClick={onClose} className={className}>
          {item.label}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClose} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center justify-between w-full py-3 text-left font-medium transition-colors hover:text-primary",
          depth === 0 ? "px-4" : "text-sm text-foreground-muted"
        )}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-l border-border/50 ml-4 mb-2"
          >
            {item.children.map((child) => (
              <MobileNavItem key={child.id} item={child} onClose={onClose} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavigation({ navigation, onClose }: { navigation: MenuNode[], onClose: () => void }) {
  if (navigation.length === 0) {
    return (
      <nav className="mt-6">
        <p className="text-sm text-muted-foreground px-4">Navigation is being loaded…</p>
      </nav>
    );
  }
  return (
    <nav className="">
      <div className="space-y-0.5">
        {navigation.map((item) => (
          <MobileNavItem key={item.id} item={item} onClose={onClose} />
        ))}
      </div>
    </nav>
  );
}
