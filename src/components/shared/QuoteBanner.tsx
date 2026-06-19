"use client";

import { motion } from "framer-motion";

interface QuoteBannerProps {
  quote?: string;
  attribution?: string;
  bgColor?: string;
  textColor?: string;
}

export function QuoteBanner({
  quote,
  attribution,
  bgColor = "#0d5844",
  textColor = "#ffffff",
}: QuoteBannerProps) {
  if (!quote) return null;

  return (
    <section
      className="py-14 relative overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Subtle decorative circles */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl"
        style={{ backgroundColor: textColor }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2 blur-3xl"
        style={{ backgroundColor: textColor }}
        aria-hidden="true"
      />

      <div className="container max-w-4xl mx-auto px-4 relative z-10 text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed md:leading-relaxed drop-shadow-sm"
            style={{ color: textColor }}
          >
            &ldquo;{quote}&rdquo;
          </p>
          {attribution && (
            <footer
              className="mt-6 text-sm md:text-base font-semibold opacity-80"
              style={{ color: textColor }}
            >
              {attribution}
            </footer>
          )}
        </motion.blockquote>
      </div>
    </section>
  );
}
