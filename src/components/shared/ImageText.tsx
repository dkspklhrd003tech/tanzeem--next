"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";

interface ImageTextProps {
  heading?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  buttonLabel?: string;
  buttonUrl?: string;
  showButton?: boolean;
  buttonNewTab?: boolean;
}

export function ImageText({
  heading,
  body,
  image,
  imageAlt = "",
  imagePosition = "right",
  buttonLabel,
  buttonUrl,
  showButton = false,
  buttonNewTab = false,
}: ImageTextProps) {
  if (!heading && !body && !image) return null;

  const imageFirst = imagePosition === "left";

  return (
    <section className="py-14 bg-background">
      <div className="container max-w-7xl mx-auto">
        <div
          className={cn(
            "flex flex-col gap-10 items-center",
            "md:flex-row",
            imageFirst && "md:flex-row-reverse"
          )}
        >
          {/* Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, x: imageFirst ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-2/5 shrink-0"
            >
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 shadow-deep">
                <img
                  src={resolveMediaUrl(image)}
                  alt={imageAlt}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: imageFirst ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 space-y-4"
          >
            {heading && (
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
                {heading}
              </h2>
            )}
            {body && (
              <div
                className="prose prose-base  max-w-none
                  prose-p:text-foreground-muted prose-p:leading-relaxed
                  prose-a:text-primary prose-headings:text-foreground
                  prose-strong:text-foreground prose-blockquote:border-primary"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            {showButton && buttonLabel && buttonUrl && (
              <div className="pt-2">
                <Link
                  href={buttonUrl.startsWith("http") ? buttonUrl : buttonUrl}
                  target={buttonNewTab || buttonUrl.startsWith("http") ? "_blank" : undefined}
                  rel={buttonNewTab || buttonUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 bg-primary text-white",
                    "px-6 py-2.5 rounded-full text-sm font-semibold",
                    "transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  )}
                >
                  {buttonLabel}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
