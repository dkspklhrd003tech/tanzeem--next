"use client";

import { motion } from "framer-motion";
import { Youtube, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";

type CTAProps = {
  settings: Record<string, string>;
};

const socialIcons = {
  youtube: Youtube,
  facebook: Facebook,
  twitter: () => (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  ),
  whatsapp: () => (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
  ),
};

export function CTA({ settings }: CTAProps) {
  const socialPlatforms = [
    { id: "youtube", name: "YouTube", icon: socialIcons.youtube, href: settings["youtube_url"] || "https://youtube.com/@tanzeemeislami", color: "bg-red-600 hover:bg-red-700", followers: "100K+" },
    { id: "facebook", name: "Facebook", icon: socialIcons.facebook, href: settings["facebook_url"] || "https://facebook.com/tanzeemeislami", color: "bg-blue-600 hover:bg-blue-700", followers: "250K+" },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: socialIcons.twitter,
      href: settings["twitter_url"] || "https://twitter.com/tanzeemeislami",
      color: "bg-black hover:bg-gray-800",
      followers: "50K+"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: socialIcons.whatsapp,
      href: settings["whatsapp_url"] || "https://wa.me/+924235869501",
      color: "bg-green-500 hover:bg-green-600",
      followers: "Channel"
    },
  ];

  return (
    <section aria-labelledby="social-heading" className="py-16 md:py-16 bg-primary relative overflow-hidden">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }} />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-white/50 text-sm font-semibold tracking-wider uppercase mb-2">&mdash; Stay Connected</p>
          <h2 id="social-heading" className="text-2xl md:text-3xl font-bold text-white">
            Connect With Us on Social Media
          </h2>
          <p className="text-white/50 mt-2 text-sm">Follow our digital platforms for the latest updates</p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {socialPlatforms.map((platform, i) => {
            const IconComponent = platform.icon;
            return (
              <motion.a
                key={platform.id}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${platform.name} \u2014 opens in new tab`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center gap-3 group",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
                )}
              >
                <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-colors", platform.color)}>
                  <IconComponent aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-primary-foreground font-semibold text-sm">{platform.name}</p>
                  <p className="text-white/50 text-xs">{platform.followers}</p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
