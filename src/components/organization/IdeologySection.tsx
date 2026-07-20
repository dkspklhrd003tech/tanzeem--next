"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Star, Compass, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IdeologyPillar {
  title: string;
  description: string;
  href: string;
  /** Optional Urdu title. Only present on static defaults. */
  urduTitle?: string;
  /** Optional link label override. Defaults to "Learn More". */
  linkLabel?: string;
}

export interface IdeologySectionProps {
  /**
   * Pillars array coming from DB (pageSections accordion items).
   * When undefined the component falls back to the static defaults below
   * so the page is never blank.
   */
  pillars?: IdeologyPillar[];
}

// ── Static fallback defaults ──────────────────────────────────────────────────
// Used when the DB has no ideology page / sections yet.

const ICON_CYCLE: LucideIcon[] = [BookOpen, Star, Compass, Heart];

const STATIC_PILLARS: Required<IdeologyPillar>[] = [
  {
    title: "Quran ul Kareem",
    urduTitle: "قرآن الکریم",
    description:
      "The Quran is the final and complete word of Allah (SWT), revealed to Prophet Muhammad (SAWS). It is the ultimate guide for all aspects of human life — individual, social, and political.",
    href: "/organization/our-ideology/basic-belief",
    linkLabel: "Our Belief",
  },
  {
    title: "Prophethood",
    urduTitle: "نبوت",
    description:
      "Belief in the Prophethood of Muhammad (SAWS) as the final messenger and complete exemplar of the Quranic message. His Sunnah is the practical model for an Islamic life.",
    href: "/organization/our-ideology/methodology",
    linkLabel: "Learn More",
  },
  {
    title: "Din-ul-Qayyim",
    urduTitle: "دینِ قیّم",
    description:
      "Islam is a complete and comprehensive way of life covering every dimension of human existence. It demands total submission to Allah in all spheres.",
    href: "/organization/our-ideology/our-obligations",
    linkLabel: "Our Obligations",
  },
  {
    title: "Our Belief",
    urduTitle: "ہمارا عقیدہ",
    description:
      "Tanzeem-e-Islami works to re-establish the Khilafah and implement the principles of Islam across social, political, and economic spheres as ordained by Allah (SWT).",
    href: "/organization/our-ideology/foundation",
    linkLabel: "Foundation",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function IdeologySection({ pillars }: IdeologySectionProps) {
  // Use DB-driven pillars when available, static defaults otherwise
  const displayPillars: IdeologyPillar[] =
    pillars && pillars.length > 0 ? pillars : STATIC_PILLARS;

  return (
    <section
      aria-labelledby="ideology-heading"
      className="py-14 bg-background border-t border-border"
    >
      <div className="container max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center"
        >
          <h2
            id="ideology-heading"
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            The Foundations of Our Work
          </h2>
        </motion.div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPillars.map((pillar, i) => {
            const Icon = ICON_CYCLE[i % ICON_CYCLE.length];
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  "bg-card border border-primary/30 rounded-xl p-6 transition-colors duration-300 hover:bg-primary-light",
                  "flex flex-col items-center text-center gap-4",
                )}
              >
                {/* Icon circle */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-foreground text-base mb-0.5">
                    {pillar.title}
                  </h3>
                  {pillar.urduTitle && (
                    <p
                      className="text-primary/70 text-sm font-nastaleeq"
                      dir="rtl"
                      lang="ur"
                    >
                      {pillar.urduTitle}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-foreground text-sm leading-relaxed flex-1">
                  {pillar.description}
                </p>

                {/* CTA */}
                <Link
                  href={pillar.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-semibold text-primary",
                    "border border-primary/30 rounded-full px-4 py-1.5",
                    "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                    "transition-colors duration-200",
                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  )}
                >
                  {pillar.linkLabel ?? "Learn More"}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
