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
    <section className="relative w-full my-6 overflow-hidden bg-slate-50" style={{ minHeight: 400 }}>
      {/* Background Image (Mosque drawing etc.) */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-contain bg-top bg-no-repeat opacity-80"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
          aria-hidden="true"
        />
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
        className="container relative z-20 px-4 py-16 md:py-24 mt-20 text-center flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ minHeight: 320 }}
      >
        {topLabel && (
          <p className="text-primary text-xs md:text-sm uppercase tracking-[0.15em] mb-4 font-bold">
            {topLabel}
          </p>
        )}
        {quoteText && (
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-foreground leading-[1.2] max-w-5xl uppercase tracking-wide">
            {quoteText}
          </h1>
        )}
        {attribution && (
          <div className="mt-6 flex flex-col items-center">
            <span className="bg-primary text-white rounded-lg px-3 py-0.5 text-sm md:text-lg font-bold">
              {attribution}
            </span>
            <span className="text-foreground text-xs md:text-sm mt-1.5 font-medium tracking-wide">Scholar Tanzeem-e-Islami</span>
          </div>
        )}
      </motion.div>
    </section>
  );
}
