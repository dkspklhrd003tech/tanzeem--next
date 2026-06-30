"use client";

import { motion } from "framer-motion";
import { Youtube, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type CTAProps = {
  settings: Record<string, string>;
};

// ── SVG icon components ───────────────────────────────────────────────────────
function TwitterIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ── Platform definitions ──────────────────────────────────────────────────────
type Platform = {
  id: string;
  name: string;
  settingsKey: string;
  fallbackUrl: string;
  color: string;
  Icon: () => React.ReactElement;
};

const PLATFORMS: Platform[] = [
  {
    id: "youtube",
    name: "YouTube",
    settingsKey: "youtube_url",
    fallbackUrl: "https://youtube.com/@tanzeemeislami",
    color: "bg-red-600 hover:bg-red-700",
    Icon: () => <Youtube className="h-7 w-7" aria-hidden="true" />,
  },
  {
    id: "facebook",
    name: "Facebook",
    settingsKey: "facebook_url",
    fallbackUrl: "https://facebook.com/tanzeemeislami",
    color: "bg-[#4267b2] hover:bg-[#365899]",
    Icon: () => <Facebook className="h-7 w-7" aria-hidden="true" />,
  },
  {
    id: "instagram",
    name: "Instagram",
    settingsKey: "instagram_url",
    fallbackUrl: "https://instagram.com/tanzeemeislami",
    color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] hover:opacity-90",
    Icon: InstagramIcon,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    settingsKey: "whatsapp_url",
    fallbackUrl: "https://wa.me/+924235869501",
    color: "bg-[#25d366] hover:bg-[#1ebe5d]",
    Icon: WhatsappIcon,
  },
  {
    id: "telegram",
    name: "Telegram",
    settingsKey: "telegram_url",
    fallbackUrl: "https://t.me/tanzeemeislami",
    color: "bg-[#2CA5E0] hover:bg-[#229ED9]",
    Icon: TelegramIcon,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    settingsKey: "twitter_url",
    fallbackUrl: "https://twitter.com/tanzeemeislami",
    color: "bg-black hover:bg-gray-800",
    Icon: TwitterIcon,
  },
];

export function CTA({ settings }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  // Only render platforms that have a configured URL or a fallback
  const platforms = PLATFORMS.filter(
    (p) => settings[p.settingsKey] || p.fallbackUrl
  );

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !iconsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" }
        }
      );

      const links = gsap.utils.toArray(".social-link");
      gsap.fromTo(links,
        { opacity: 0, scale: 0.5, y: 50, rotateX: 45 },
        {
          opacity: 1, scale: 1, y: 0, rotateX: 0,
          duration: 1,
          stagger: 0.1,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: iconsRef.current, start: "top 85%" }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="social-heading"
      className="py-10 bg-primary/95 relative overflow-hidden perspective-1000 shadow-[0_0_50px_rgba(16,185,129,0.3)] z-10"
    >
      {/* Subtle dot pattern and glow */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto relative z-20 px-4">
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase mb-4">
            Stay Connected
          </p>
          <h2
            id="social-heading"
            className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight"
          >
            Follow Us On Social Media
          </h2>
          <p className="text-white/70 mt-4 text-base md:text-lg max-w-2xl mx-auto">
            We&apos;re Connecting To All Digital Life
          </p>
        </div>

        <div ref={iconsRef} className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {platforms.map((platform, i) => {
            const href = settings[platform.settingsKey] || platform.fallbackUrl;
            return (
              <a
                key={platform.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${platform.name} — opens in new tab`}
                className={cn(
                  "social-link flex flex-col items-center gap-4 group relative",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
                )}
              >
                {/* Glow Effect */}
                <div className={cn("absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none", platform.color.split(' ')[0])} />

                <div
                  className={cn(
                    "relative w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] flex items-center justify-center",
                    "text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-500",
                    "group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover:rotate-6",
                    platform.color
                  )}
                >
                  <div className="scale-[1.2] transition-transform duration-500 group-hover:scale-[1.3] drop-shadow-md">
                    <platform.Icon />
                  </div>
                </div>
                <p className="text-white font-bold text-sm text-center tracking-wide group-hover:text-white/100 text-white/70 transition-colors duration-500">
                  {platform.name}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
