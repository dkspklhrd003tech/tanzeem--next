"use client";

import { motion } from "framer-motion";
import React from "react";

interface OrgHeroProps {
  topLabel?: string;
  quoteText?: string;
  attribution?: string;
  backgroundImage?: string;
  decorativeImage?: string;
}

export function OrgHero({
  topLabel,
  quoteText,
  attribution,
  backgroundImage,
  decorativeImage,
}: OrgHeroProps) {
  const hasContent = quoteText || topLabel;
  if (!hasContent && !backgroundImage) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 320 }}>
      {/* Background */}
      {backgroundImage ? (
        <div
          className="absolute inset-0 z-0 bg-contain bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-primary" aria-hidden="true" />
      )}


      {/* Decorative Islamic geometry – right side */}
      {decorativeImage && (
        <div className="absolute right-0 top-0 h-full w-1/3 z-10 opacity-30 pointer-events-none">
          <img
            src={decorativeImage}
            alt=""
            className="h-full w-full object-cover object-left"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="container relative z-20 px-4 py-16 md:py-20 text-center flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ minHeight: 320 }}
      >
        {topLabel && (
          <p className="text-white/60 text-xs md:text-sm uppercase tracking-[0.25em] mb-4 font-semibold">
            {topLabel}
          </p>
        )}
        {quoteText && (
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug max-w-4xl drop-shadow-lg uppercase tracking-wide">
            {quoteText}
          </h1>
        )}
        {attribution && (
          <p className="mt-5 text-white/80 text-sm md:text-base font-semibold">
            {attribution}
          </p>
        )}
      </motion.div>
    </section>
  );
}
