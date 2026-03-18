"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Twitter,
  Heart
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  about: {
    title: "About Us",
    links: [
      { name: "Introduction", href: "/organization/introduction" },
      { name: "History", href: "/organization/history" },
      { name: "Bani Tanzeem", href: "/organization/founder" },
      { name: "Ameer Tanzeem", href: "/organization/ameer" },
      { name: "Join Tanzeem", href: "/join" },
    ],
  },
  audios: {
    title: "Audios",
    links: [
      { name: "Dr. Israr Ahmed", href: "/resources/audios" },
      { name: "Dars-e-Quran", href: "/resources/audios" },
      { name: "Q&A Sessions", href: "/resources/audios" },
      { name: "Bayaans", href: "/resources/audios" },
    ],
  },
  booksArticles: {
    title: "Books & Articles",
    links: [
      { name: "All Books", href: "/resources/books" },
      { name: "Articles", href: "/resources/articles" },
      { name: "Press Releases", href: "/resources/press" },
      { name: "Magazines", href: "/resources/magazines" },
    ],
  },
  videos: {
    title: "Videos",
    links: [
      { name: "Lectures", href: "/resources/videos" },
      { name: "Zamana Gawah Hai", href: "/resources/videos" },
      { name: "Ameer Say Mulaqat", href: "/resources/videos" },
      { name: "Q&A", href: "/resources/videos" },
    ],
  },
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/tanzeemeislami" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@tanzeemeislami" },
];

export function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
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

    fetchSettings();
  }, []);
  return (
    <footer className="bg-background-dark text-[#fefefc] /70">
      {/* Main Footer */}
      <div className="container mx-auto py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-[#fefefc]  font-semibold mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-[#fefefc] /50 hover:text-[#fefefc]  transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Us Column */}
          <div>
            <h3 className="text-[#fefefc]  font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-[#fefefc] /50 text-sm">
                <MapPin className="h-4 w-4 text-[#fefefc] /30 mt-0.5 shrink-0" />
                <span>{settings.footer_address || "67-A, Johar Town, Lahore, Pakistan"}</span>
              </div>
              <a href={`tel:${settings.whatsapp_number || '+924235869501'}`} className="flex items-center gap-2.5 text-white/50 hover:text-[#fefefc] transition-colors text-sm">
                <Phone className="h-4 w-4 text-white/30 shrink-0" />
                <span>{settings.whatsapp_number || "+92 (42) 35869501-3"}</span>
              </a>
              <a href={`mailto:${settings.contact_email || 'info@tanzeem.org'}`} className="flex items-center gap-2.5 text-white/50 hover:text-[#fefefc] transition-colors text-sm break-all">
                <Mail className="h-4 w-4 text-white/30 shrink-0" />
                <span>{settings.contact_email || "info@tanzeem.org"}</span>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">
            {settings.footer_copyright || `© ${new Date().getFullYear()} Tanzeem-e-Islami. All rights reserved.`}
          </p>

          <div className="flex items-center gap-3">
            {settings.facebook_url && (
              <motion.a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:text-[#fefefc] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook className="h-4 w-4" />
              </motion.a>
            )}

            {settings.twitter_url && (
              <motion.a
                href={settings.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-black hover:text-[#fefefc] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="h-4 w-4" />
              </motion.a>
            )}

            {settings.youtube_url && (
              <motion.a
                href={settings.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-red-600 hover:text-[#fefefc] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube className="h-4 w-4" />
              </motion.a>
            )}

            {settings.whatsapp_url && (
              <motion.a
                href={settings.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-green-500 hover:text-[#fefefc] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </motion.a>
            )}
          </div>

          <p className="text-white/30 text-xs flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for the Ummah
          </p>
        </div>
      </div>
    </footer>
  );
}
