"use client";

import { motion } from "framer-motion";
import { Youtube, Facebook, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type PlatformRecord = {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  url?: string;
  iconUrl?: string | null;
  themeColor?: string | null;
  color?: string | null;
};

type CTAProps = {
  platforms: PlatformRecord[];
};

// ── SVG icon components ───────────────────────────────────────────────────────
function TwitterIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.62-5.18 2.56-6.73 1.09-.87 2.45-1.36 3.86-1.52.12-.01.24-.01.36-.02v4.06c-.95.02-1.92.26-2.73.84-.71.49-1.18 1.25-1.33 2.1-.13.84.14 1.75.69 2.41.6.72 1.5 1.14 2.44 1.18 1.28.05 2.53-.59 3.13-1.7.35-.61.5-1.33.49-2.04.01-4.54-.03-9.08.02-13.62Z" />
    </svg>
  );
}

function SoundcloudIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1.175 12.225c-.06.075-.105.15-.15.255v4.56c.045.105.09.18.15.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.105-.15.105-.255v-4.56c0-.105-.03-.18-.105-.255-.075-.075-.18-.105-.285-.105h-.405c-.105 0-.21.03-.285.105zm1.5-1.74c-.06.075-.105.15-.105.255v6.315c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.12-.15.12-.255V10.74c0-.105-.045-.18-.12-.255-.075-.075-.18-.105-.285-.105h-.405c-.105.015-.21.045-.285.105zm1.515-2.01c-.06.075-.105.15-.105.255v8.325c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.12-.15.12-.255V8.73c0-.105-.045-.18-.12-.255-.075-.075-.18-.105-.285-.105H4.47c-.105 0-.21.03-.285.105zm1.515.12c-.06.075-.105.15-.105.255v8.085c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.105-.15.105-.255V8.85c0-.105-.03-.18-.105-.255-.075-.075-.18-.105-.285-.105h-.405c-.105 0-.21.03-.285.105zm1.515-2.07c-.06.075-.105.15-.105.255v10.155c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.105-.15.105-.255V6.78c0-.105-.03-.18-.105-.255-.075-.075-.18-.105-.285-.105h-.405c-.105 0-.21.03-.285.105zm1.5 2.145c-.06.075-.105.15-.105.255v7.92c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.105-.15.105-.255v-7.92c0-.105-.03-.18-.105-.255-.075-.075-.18-.105-.285-.105H8.97c-.105 0-.21.03-.285.105zm1.515.225c-.06.075-.105.15-.105.255v7.455c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.105-.15.105-.255v-7.455c0-.105-.03-.18-.105-.255-.075-.075-.18-.105-.285-.105h-.405c-.105 0-.21.03-.285.105zm1.515-.315c-.06.075-.105.15-.105.255v8.085c0 .105.045.18.105.255.075.06.18.105.285.105h.405c.105 0 .21-.045.285-.105.075-.075.105-.15.105-.255V8.82c0-.105-.03-.18-.105-.255-.075-.075-.18-.105-.285-.105h-.405c-.105 0-.21.03-.285.105zM24 17.295c0-2.31-1.875-4.17-4.17-4.17-.18 0-.36.015-.54.045C18.66 10.455 16.29 8.4 13.41 8.4c-2.94 0-5.4 2.37-5.52 5.295v3.6h11.94c2.31 0 4.17-1.86 4.17-4.17Z" />
    </svg>
  );
}

function RumbleIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.522 17.59h-2.19v4.204H.88V2.206h6.71c3.812 0 6.136 2.052 6.136 5.27 0 2.217-1.127 3.864-2.834 4.708l3.655 5.405h-2.753l-3.23-4.992H5.523v4.992Zm0-7.078h2.38c2.19 0 3.376-1.103 3.376-2.833 0-1.782-1.185-2.834-3.375-2.834h-2.38v5.667ZM23.12 11.23h-6.195a.72.72 0 0 0-.505.207l-2.094 2.071c-.266.262-.266.69 0 .953l2.094 2.07c.133.132.315.207.505.207h6.195c.394 0 .714-.316.714-.706v-4.096c0-.39-.32-.705-.714-.705Z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.604 0 12.017 0z" />
    </svg>
  );
}

const iconMap: Record<string, any> = {
  youtube: () => <Youtube className="h-7 w-7" aria-hidden="true" />,
  facebook: () => <Facebook className="h-7 w-7" aria-hidden="true" />,
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
  telegram: TelegramIcon,
  twitter: TwitterIcon,
  x: TwitterIcon,
  tiktok: TiktokIcon,
  soundcloud: SoundcloudIcon,
  rumble: RumbleIcon,
  pinterest: PinterestIcon,
  web: () => <Globe className="h-7 w-7" aria-hidden="true" />
};

export function CTA({ platforms }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

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
      className="py-10 px-6 bg-primary"
    >
      {/* Subtle dot pattern and glow */}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto relative z-20">
        <div ref={headerRef} className="text-center mb-8">
          <p className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase mb-4">
            Connect with Tanzeem
          </p>
          <h2
            id="social-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg tracking-tight"
          >
            Follow Us On Social Media
          </h2>
          <p className="text-white/70 mt-4 text-base md:text-lg max-w-2xl mx-auto">
            We&apos;re Connecting To All Digital Life
          </p>
        </div>

        <div ref={iconsRef} className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {platforms.map((platform, i) => {
            const slugOrIcon = platform.slug || platform.icon || "globe";
            const href = platform.url || `/social-media#${slugOrIcon}`;
            const isUrl = slugOrIcon.startsWith("http") || slugOrIcon.startsWith("/");
            const Icon = isUrl
              ? () => <img src={slugOrIcon} alt={platform.name} className="h-7 w-7 object-contain brightness-0 invert" aria-hidden="true" />
              : (iconMap[slugOrIcon.toLowerCase()] || (() => <Globe className="h-7 w-7" aria-hidden="true" />));
            const originalColor = platform.themeColor || platform.color || "#0d5844";

            return (
              <a
                key={platform.id}
                href={href}
                aria-label={`${platform.name} — social media page`}
                className={cn(
                  "social-link flex flex-col items-center gap-4 group relative",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
                )}
              >
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: originalColor }}
                />

                <div
                  className={cn(
                    "relative w-15 h-15 md:w-20 md:h-20 rounded-[1.5rem] flex items-center justify-center",
                    "text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-500",
                    "group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover:rotate-6"
                  )}
                  style={{ backgroundColor: originalColor }}
                >
                  <div className="scale-[1.2] transition-transform duration-500 group-hover:scale-[1.3] drop-shadow-md">
                    <Icon />
                  </div>
                </div>
                <p className="text-white text-sm text-center tracking-wide group-hover:text-white/100 text-white/70 transition-colors duration-500">
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
