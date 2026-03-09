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
    <footer className="bg-background-dark text-white/70">
      {/* Main Footer */}
      <div className="container mx-auto py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/50 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Us Column */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-white/50 text-sm">
                <MapPin className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
                <span>{settings.footer_address || "67-A, Johar Town, Lahore, Pakistan"}</span>
              </div>
              <a href={`tel:${settings.whatsapp_number || '+924235869501'}`} className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors text-sm">
                <Phone className="h-4 w-4 text-white/30 shrink-0" />
                <span>{settings.whatsapp_number || "+92 (42) 35869501-3"}</span>
              </a>
              <a href={`mailto:${settings.contact_email || 'info@tanzeem.org'}`} className="flex items-center gap-2.5 text-white/50 hover:text-white transition-colors text-sm break-all">
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

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {settings.facebook_url && (
              <motion.a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook className="h-4 w-4" />
              </motion.a>
            )}

            {settings.youtube_url && (
              <motion.a
                href={settings.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube className="h-4 w-4" />
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
