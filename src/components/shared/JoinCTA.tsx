"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinCardConfig {
  title?: string;
  location?: string;
  phone?: string;
  description?: string;
  linkLabel?: string;
  linkUrl?: string;
}

interface JoinCTAProps {
  heading?: string;
  subtitle?: string;
  cards?: JoinCardConfig[];
  bgColor?: string;
  textColor?: string;
}

export function JoinCTA({
  heading = "Join Tanzeem-e-Islami",
  subtitle,
  cards = [],
  bgColor = "#0d5844",
  textColor = "#ffffff",
}: JoinCTAProps) {
  if (!heading && cards.length === 0) return null;

  return (
    <section
      className="py-8 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/3 blur-3xl"
        style={{ backgroundColor: textColor }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-[0.06] translate-y-1/3 -translate-x-1/4 blur-3xl"
        style={{ backgroundColor: textColor }}
        aria-hidden="true"
      />

      <div className="container max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {heading && (
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: heading }}
            />
          )}
          {subtitle && (
            <p
              className="mt-3 text-sm md:text-base max-w-2xl mx-auto leading-relaxed opacity-80"
              style={{ color: textColor }}
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
        </motion.div>

        {cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center"
              >
                {card.title && (
                  <h3 className="text-xl font-bold text-accent-gold mb-3">{card.title}</h3>
                )}
                {card.location && (
                  <p className="text-white/70 text-xs flex items-center justify-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {card.location}
                  </p>
                )}
                {card.phone && (
                  <p className="text-white/70 text-xs flex items-center justify-center gap-1.5 mb-3">
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    {card.phone}
                  </p>
                )}
                {card.description && (
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{card.description}</p>
                )}
                {card.linkUrl && (
                  <Link
                    href={card.linkUrl}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold",
                      "border-2 border-white text-white",
                      "hover:bg-white hover:text-[#0d5844] transition-colors",
                    )}
                  >
                    {card.linkLabel || "Join Now"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
