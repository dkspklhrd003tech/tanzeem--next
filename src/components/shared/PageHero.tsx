"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PageHero — used by DynamicPageContent for section type "hero" on non-home pages.
 *
 * Unlike the home Hero (full-width slider carousel), this renders a single
 * static banner: background image + overlay + centered title/subtitle.
 * Matches the tanzeem.org page-banner style seen on /organization, /contact-us, etc.
 */
interface PageHeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

export function PageHero({ title, subtitle, backgroundImage }: PageHeroProps) {
  if (!title && !subtitle && !backgroundImage) return null;

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center text-center"
      style={{ minHeight: "280px" }}
    >
      {/* Background image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
          aria-hidden="true"
        />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ backgroundColor: "#003d25", opacity: 0.72 }}
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="container relative z-20 px-4 py-16"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {title && (
          <h1
            className={cn(
              "text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4",
            )}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </motion.div>
    </section>
  );
}
