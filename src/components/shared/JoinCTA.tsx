"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinCardConfig {
  title?: string;
  image?: string;
  location?: string;
  phone?: string;
  email?: string;
  description?: string;
  linkLabel?: string;
  linkUrl?: string;
  linkNewTab?: boolean;
}

interface JoinCTAProps {
  heading?: string;
  subtitle?: string;
  cards?: JoinCardConfig[];
}

export function JoinCTA({
  heading = "Join Tanzeem-e-Islami",
  subtitle,
  cards = [],
}: JoinCTAProps) {
  if (!heading && cards.length === 0) return null;

  return (
    <section className="py-16 relative bg-background border-t border-border">
      <div className="container max-w-5xl mx-auto relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {heading && (
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
              dangerouslySetInnerHTML={{ __html: heading }}
            />
          )}
          {subtitle && (
            <p
              className="mt-4 text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
        </motion.div>

        {cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-mid transition-all flex flex-col group"
              >
                {/* Image Section */}
                {card.image && (
                  <div className="w-full aspect-video bg-muted relative overflow-hidden">
                    <img 
                      src={card.image} 
                      alt={card.title || "Join Image"} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                
                <div className="p-8 flex flex-col flex-1 items-center text-center">
                  {card.title && (
                    <h3 className="text-2xl font-bold text-foreground mb-6">{card.title}</h3>
                  )}

                  <div className="space-y-3 mb-8 flex-1 w-full">
                    {card.location && (
                      <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        <span>{card.location}</span>
                      </p>
                    )}
                    {card.phone && (
                      <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        <span>{card.phone}</span>
                      </p>
                    )}
                    {card.email && (
                      <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        <span>{card.email}</span>
                      </p>
                    )}
                    {card.description && (
                      <p className="text-muted-foreground text-sm mt-4 leading-relaxed">{card.description}</p>
                    )}
                  </div>

                  {card.linkUrl && (
                    <div className="w-full mt-auto">
                      <Link
                        href={card.linkUrl}
                        target={card.linkNewTab ? "_blank" : undefined}
                        rel={card.linkNewTab ? "noopener noreferrer" : undefined}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold w-full",
                          "bg-primary text-primary-foreground",
                          "hover:bg-primary/90 hover:shadow-md transition-all",
                        )}
                      >
                        {card.linkLabel || "Join Now"}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
