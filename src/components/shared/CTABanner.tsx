"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  heading: string;
  subheading?: string;
  buttonLabel: string;
  buttonUrl: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

export function CTABanner({
  heading,
  subheading,
  buttonLabel,
  buttonUrl,
  backgroundColor = "#c8a84e",
  backgroundImage,
}: CTABannerProps) {
  return (
    <section
      className="py- bg-primary/95 relative overflow-hidden perspective-1000 shadow-[0_0_50px_rgba(16,185,129,0.3)] z-10"
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-contain bg-center opacity-20"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      <div className="container px-4 py-6 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                {subheading}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href={buttonUrl}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-full hover:bg-black hover:text-white transition-all duration-300 group shadow-xl"
            >
              {buttonLabel}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
