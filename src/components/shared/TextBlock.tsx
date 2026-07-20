"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TextBlockProps {
  heading?: string;
  subheading?: string;
  body?: string;
  align?: "left" | "center" | "right";
  showButton?: boolean;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonNewTab?: boolean;
}

export function TextBlock({
  heading,
  subheading,
  body,
  align = "left",
  showButton = false,
  buttonLabel = "",
  buttonUrl = "",
  buttonNewTab = false
}: TextBlockProps) {
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
              prose-ul:flex prose-ul:flex-wrap prose-ul:gap-2 prose-ul:list-none prose-ul:p-0 prose-ul:m-0 prose-ul:mt-4
              prose-li:bg-primary/5 prose-li:text-primary prose-li:px-4 prose-li:py-1.5 prose-li:rounded-full prose-li:text-sm prose-li:font-semibold prose-li:m-0 prose-li:border prose-li:border-primary/10 prose-li:shadow-sm
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-foreground-muted"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {/* Action Button */}
        {showButton && buttonLabel && buttonUrl && (
          <div className={cn(
            "mt-8 flex",
            align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
          )}>
            <Button asChild size="lg" className="rounded-lg px-4 py-1 text-base font-semibold">
              <Link href={buttonUrl.startsWith("http") ? buttonUrl : buttonUrl} target={buttonNewTab || buttonUrl.startsWith("http") ? "_blank" : undefined} rel={buttonNewTab || buttonUrl.startsWith("http") ? "noopener noreferrer" : undefined}>
                {buttonLabel}
              </Link>
            </Button>
          </div>
        )}
      </motion.div>
    </section>
  );
}
