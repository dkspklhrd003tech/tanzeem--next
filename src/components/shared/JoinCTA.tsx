"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinCTAProps {
  heading?: string;
  subheading?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  bgColor?: string;
  textColor?: string;
}

export function JoinCTA({
  heading = "Join Tanzeem-e-Islami",
  subheading,
  buttonLabel = "Join Now",
  buttonUrl = "/join-tanzeem",
  bgColor = "#0d5844",
  textColor = "#ffffff",
}: JoinCTAProps) {
  return (
    <section
      className="py-16 relative overflow-hidden"
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

      <div className="container max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {heading && (
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: textColor }}
            >
              {heading}
            </h2>
          )}
          {subheading && (
            <p
              className="text-base md:text-lg leading-relaxed opacity-80"
              style={{ color: textColor }}
            >
              {subheading}
            </p>
          )}
          {buttonUrl && buttonLabel && (
            <div>
              <Link
                href={buttonUrl}
                className={cn(
                  "inline-flex items-center gap-2",
                  "px-8 py-3 rounded-full text-sm font-bold",
                  "border-2 transition-all duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2"
                )}
                style={{
                  borderColor: textColor,
                  color: bgColor,
                  backgroundColor: textColor,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = textColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = textColor;
                  (e.currentTarget as HTMLElement).style.color = bgColor;
                }}
              >
                {buttonLabel}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
