"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  heading?: string;
  subheading?: string;
  body?: string;
  align?: "left" | "center" | "right";
}

export function TextBlock({ heading, subheading, body, align = "left" }: TextBlockProps) {
  if (!heading && !body && !subheading) return null;

  return (
    <section className="py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          "container max-w-4xl mx-auto",
          align === "center" && "text-center",
          align === "right" && "text-right"
        )}
      >
        {subheading && (
          <p className="section-label mb-2 text-sm">
            {subheading}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {heading}
          </h2>
        )}
        {body && (
          <div
            className="prose prose-lg  max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-foreground-muted prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-blockquote:border-primary
              prose-li:text-foreground-muted"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}
      </motion.div>
    </section>
  );
}
