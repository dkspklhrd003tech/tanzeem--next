"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen, Star, Compass, Heart,
  Shield, Globe, Users, Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Icon registry (matches PageSectionBuilder select options) ─────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  book: BookOpen,
  star: Star,
  compass: Compass,
  heart: Heart,
  shield: Shield,
  globe: Globe,
  users: Users,
  lightbulb: Lightbulb,
};

interface IdeologyCard {
  icon?: string;
  title?: string;
  urduTitle?: string;
  description?: string;
  linkLabel?: string;
  linkUrl?: string;
}

interface IdeologyCardsProps {
  heading?: string;
  cards?: IdeologyCard[];
}

export function IdeologyCards({ heading, cards = [] }: IdeologyCardsProps) {
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="ideology-cards-heading" className="py-14 bg-background border-t border-border">
      <div className="container max-w-7xl mx-auto">

        {heading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2
              id="ideology-cards-heading"
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              {heading}
            </h2>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => {
            const Icon = ICON_MAP[card.icon ?? "book"] ?? BookOpen;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  "bg-card border border-border rounded-xl p-6",
                  "flex flex-col items-center text-center gap-4",
                  "hover:shadow-mid transition-shadow duration-300"
                )}
              >
                {/* Icon circle */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>

                {/* Titles */}
                <div>
                  {card.title && (
                    <h3 className="font-bold text-foreground text-base mb-0.5">
                      {card.title}
                    </h3>
                  )}
                  {card.urduTitle && (
                    <p
                      className="text-primary/70 text-sm font-nastaleeq"
                      dir="rtl"
                      lang="ur"
                    >
                      {card.urduTitle}
                    </p>
                  )}
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-foreground-muted text-sm leading-relaxed flex-1">
                    {card.description}
                  </p>
                )}

                {/* CTA */}
                {card.linkUrl && (
                  <Link
                    href={card.linkUrl}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-semibold text-primary",
                      "border border-primary/30 rounded-full px-4 py-1.5",
                      "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                      "transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                    )}
                  >
                    {card.linkLabel ?? "Learn More"}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
