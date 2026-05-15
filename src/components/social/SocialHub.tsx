"use client";

import { useState } from "react";
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
  ChevronLeft
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  themeColor?: string;
}

interface Account {
  id: string;
  platformId: string;
  title: string;
  url: string;
  imageUrl?: string;
  buttonText: string;
}

interface SocialHubProps {
  initialPlatforms: Platform[];
  initialAccounts: Account[];
}

// Map slug to icon - fallback if iconUrl is not a full URL
const iconMap: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  telegram: Send,
  whatsapp: Send,
  tiktok: Video,
  web: Globe,
  soundcloud: Music,
  pinterest: Pin,
  rumble: Video
};

export function SocialHub({ initialPlatforms, initialAccounts }: SocialHubProps) {
  const [activeTab, setActiveTab] = useState(initialPlatforms[0]?.id || "");

  const activePlatform = initialPlatforms.find(p => p.id === activeTab);
  const filteredAccounts = initialAccounts.filter(a => a.platformId === activeTab);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex justify-start md:justify-center items-center gap-3 min-w-max">
          {initialPlatforms.map((platform) => {
            const Icon = iconMap[platform.slug.toLowerCase()] || Globe;
            const isActive = activeTab === platform.id;

            return (
              <button
                key={platform.id}
                onClick={() => setActiveTab(platform.id)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                  isActive
                    ? "bg-[#0d5844] text-[#fefefc] shadow-xl shadow-[#0d5844]/20 scale-105"
                    : "bg-white text-[#0d5844] border border-[#0d5844]/10 hover:border-[#0d5844]/30 hover:bg-[#0d5844]/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
                {platform.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account, idx) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-white rounded-3xl border border-[#0d5844]/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-center p-8 text-center"
                >
                  {/* Theme Border Accent */}
                  <div
                    className="absolute top-0 left-0 w-full h-1.5 opacity-20"
                    style={{ backgroundColor: activePlatform?.themeColor || "#0d5844" }}
                  />

                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#0d5844]/5 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 blur-xl" />
                    <img
                      src={account.imageUrl || "https://img.icons8.com/color/144/user.png"}
                      alt={account.title}
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:border-[#0d5844]/10 transition-all"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#0d5844] mb-2 leading-tight group-hover:text-primary transition-colors">
                    {account.title}
                  </h3>

                  <p className="text-xs text-[#0d5844]/60 font-medium mb-8 line-clamp-1 uppercase tracking-widest">
                    {activePlatform?.name} Official
                  </p>

                  <a
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0d5844] text-[#fefefc] font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-[#0d5844]/30 active:scale-95 group/btn"
                  >
                    {account.buttonText}
                    <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </a>

                  {/* Glassmorphism Background Decoration */}
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#0d5844]/5 rounded-full blur-3xl group-hover:bg-[#0d5844]/10 transition-colors" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border-2 border-dashed border-[#0d5844]/10">
                <div className="w-20 h-20 bg-[#0d5844]/5 rounded-full mb-6 flex items-center justify-center">
                  <Globe className="w-10 h-10 text-[#0d5844]/30" />
                </div>
                <h3 className="text-2xl font-black text-[#0d5844] mb-2">No Connections Yet</h3>
                <p className="text-[#0d5844]/60 max-w-xs">We're expanding our presence to this platform. Stay tuned for official links!</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
