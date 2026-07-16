"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Send,
  Globe,
  Music,
  Video,
  Pin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  LayoutGrid,
  Columns
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  themeColor?: string | null;
  anchorTag?: string | null;
}

interface Account {
  id: string;
  platformId: string;
  title: string;
  url: string;
  imageUrl?: string | null;
  buttonText: string;
  order: number;
  isActive: boolean;
}

interface SocialHubProps {
  initialPlatforms: Platform[];
  initialAccounts: Account[];
  layout?: "horizontal" | "vertical";
}

const iconMap: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  telegram: Send,
  whatsapp: MessageSquare,
  tiktok: Video,
  web: Globe,
  soundcloud: Music,
  pinterest: Pin,
  rumble: Video
};

export function SocialHub({ initialPlatforms, initialAccounts, layout = "horizontal" }: SocialHubProps) {
  const [currentLayout, setCurrentLayout] = useState<"horizontal" | "vertical">(layout);
  const [activeTab, setActiveTab] = useState(initialPlatforms[0]?.id || "");
  const sliderRef = useRef<HTMLDivElement>(null);

  // Parse hash on mount to select active tab
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      // Find platform by slug or name matching the hash
      const matched = initialPlatforms.find(p =>
        (p.anchorTag && p.anchorTag.toLowerCase() === hash.toLowerCase()) ||
        p.slug.toLowerCase() === hash.toLowerCase() ||
        p.name.toLowerCase().includes(hash.toLowerCase())
      );
      if (matched) {
        setActiveTab(matched.id);
      }
    }
  }, [initialPlatforms]);

  // Keep state in sync if parent prop changes
  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  const activePlatform = initialPlatforms.find(p => p.id === activeTab);
  const filteredAccounts = initialAccounts
    .filter(a => a.platformId === activeTab && a.isActive)
    .sort((a, b) => a.order - b.order);

  const getSubtitles = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes("youtube")) {
      return {
        heading: "YouTube Channels",
        sub: "Subscribe to our YouTube channels for latest videos"
      };
    }
    if (name.includes("instagram")) {
      return {
        heading: "Instagram Profiles",
        sub: "Follow us on Instagram for daily updates and highlights"
      };
    }
    if (name.includes("facebook")) {
      return {
        heading: "Facebook Pages",
        sub: "Join our Facebook community for news and interactions"
      };
    }
    if (name.includes("whatsapp")) {
      return {
        heading: "WhatsApp Channels",
        sub: "Subscribe to our WhatsApp channels for direct updates"
      };
    }
    if (name.includes("telegram")) {
      return {
        heading: "Telegram Channels",
        sub: "Join our Telegram channels for publications and audios"
      };
    }
    if (name.includes("twitter") || name.includes("x")) {
      return {
        heading: "Twitter / X Handles",
        sub: "Follow us on Twitter for real-time announcements"
      };
    }
    return {
      heading: `${platformName} Handles`,
      sub: `Connect with us on ${platformName} for resources`
    };
  };

  const currentText = activePlatform ? getSubtitles(activePlatform.name) : { heading: "Social Accounts", sub: "Connect with us" };

  const handleScroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.75;
      sliderRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Render the Platform Tabs List
  const renderTabsList = (isVertical: boolean) => {
    return (
      <div className={cn(
        "flex gap-2 md:gap-3",
        isVertical ? "flex-col w-full" : "flex-wrap justify-center items-center"
      )}>
        {initialPlatforms.map((platform) => {
          const Icon = iconMap[platform.slug.toLowerCase()] || Globe;
          const isActive = activeTab === platform.id;
          const originalColor = platform.themeColor || "#0d5844";

          const anchor = platform.anchorTag || platform.slug.toLowerCase();

          return (
            <a
              key={platform.id}
              id={anchor}
              href={`#${anchor}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(platform.id);
                window.history.pushState(null, "", `#${anchor}`);
              }}
              style={
                isActive
                  ? {
                    backgroundColor: originalColor,
                    color: "#ffffff",
                    boxShadow: `0 10px 15px -3px ${originalColor}30`,
                  }
                  : {
                    color: originalColor,
                    borderColor: `${originalColor}30`,
                    backgroundColor: "#ffffff",
                  }
              }
              className={cn(
                "flex items-center gap-2.5 px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 border hover:scale-105",
                isVertical && "w-full justify-start rounded-xl"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{platform.name}</span>
            </a>
          );
        })}
      </div>
    );
  };

  // Render the accounts carousel content block
  const renderCarouselContent = () => {
    return (
      <div className="relative group/slider px-2">
        {filteredAccounts.length > 0 && (
          <>
            {/* Left Scroll Button */}
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-[-16px] md:left-[-24px] top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-[#0d5844] text-white flex items-center justify-center shadow-lg hover:bg-[#0d5844]/90 active:scale-95 transition-all opacity-90 hover:opacity-100"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-[-16px] md:right-[-24px] top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-[#0d5844] text-white flex items-center justify-center shadow-lg hover:bg-[#0d5844]/90 active:scale-95 transition-all opacity-90 hover:opacity-100"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-6 pb-8 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="popLayout">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center p-8 text-center relative border-l-4 border-l-red-500 hover:shadow-xl transition-all duration-300"
                >
                  {/* Circle Image Wrapper */}
                  <div className="relative mb-2">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200/80 p-1 bg-white">
                      <img
                        src={account.imageUrl || "https://img.icons8.com/color/144/user.png"}
                        alt={account.title}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-800 mb-4 leading-snug line-clamp-2 h-10 flex items-center justify-center">
                    {account.title}
                  </h3>

                  {/* Dynamic Action Button */}
                  <a
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-[#0d5844] hover:bg-[#0b4837] text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95"
                  >
                    <span className="line-clamp-1">{account.title}</span>
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              ))
            ) : (
              <div className="w-full min-h-[280px] flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 col-span-full">
                <div className="w-16 h-16 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-slate-400">
                  <Globe className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">No Active Accounts</h4>
                <p className="text-xs text-slate-400 max-w-xs">We haven't listed any official links for this platform yet.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">

      {/* Premium Glassmorphic Layout Orientation Toggle switcher */}
      <div className="flex justify-end mb-6 max-w-7xl mx-auto">
        <div className="inline-flex bg-slate-100/80 backdrop-blur-md p-1 rounded-xl border border-slate-200/50 shadow-sm">
          <button
            onClick={() => setCurrentLayout("horizontal")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg-xl text-xs font-black tracking-wide uppercase transition-all duration-300",
              currentLayout === "horizontal"
                ? "bg-[#0d5844] text-white shadow-md scale-[1.03]"
                : "text-slate-500 hover:text-[#0d5844]"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Horizontal View
          </button>
          <button
            onClick={() => setCurrentLayout("vertical")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg-xl text-xs font-black tracking-wide uppercase transition-all duration-300",
              currentLayout === "vertical"
                ? "bg-[#0d5844] text-white shadow-md scale-[1.03]"
                : "text-slate-500 hover:text-[#0d5844]"
            )}
          >
            <Columns className="w-3.5 h-3.5" />
            Vertical View
          </button>
        </div>
      </div>

      {/* Main content body rendered dynamically based on selected layout */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full"
      >
        {currentLayout === "vertical" ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left Sidebar - Social Platforms */}
            <div className="w-full lg:w-72 shrink-0 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-normal mb-4 px-2">
                Tanzeem Social Channels
              </h3>
              {renderTabsList(true)}
            </div>

            {/* Right Area - Heading, Subtitle & Card Carousel */}
            <div className="flex-1 w-full min-w-0">
              <div className="mb-4 lg:mb-6 text-left px-2 animate-fadeIn">
                <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 tracking-tight mb-2">
                  {currentText.heading}
                </h2>
              </div>

              {renderCarouselContent()}
            </div>

          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            {/* Platform Tab Selector Bar */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-4 md:p-6 mb-12 shadow-sm">
              {renderTabsList(false)}
            </div>

            {/* Dynamic Subheading and Info */}
            <div className="text-center mb-4 lg:mb-6">
              <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 tracking-tight mb-2">
                {currentText.heading}
              </h2>
            </div>

            {renderCarouselContent()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
