"use client";

import { cn } from "@/lib/utils";

interface IntroSectionProps {
  heading: string;
  subheading?: string;
  body: string;
  image?: string;
  imageAlt?: string;
  alignment?: "left" | "right";
  backgroundColor?: string;
}

export function IntroSection({
  heading,
  subheading,
  body,
  image,
  imageAlt,
  alignment = "left",
  backgroundColor = "transparent",
}: IntroSectionProps) {
  return (
    <section
      className="py-16 md:py-10 overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="container px-4 mx-auto">
        <div className={cn(
          "flex flex-col gap-12 items-center",
          alignment === "right" ? "md:flex-row-reverse" : "md:flex-row"
        )}>
          {/* Text Content */}
          <div className="flex-1 space-y-6">
            {subheading && (
              <span className="text-primary font-bold uppercase tracking-wider text-sm">
                {subheading}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {heading}
            </h2>
            <div
              className="prose prose-lg text-foreground-muted max-w-none"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>

          {/* Image */}
          {image && (
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={image}
                  alt={imageAlt || heading}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
