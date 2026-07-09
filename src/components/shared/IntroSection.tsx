"use client";

import { cn, resolveMediaUrl } from "@/lib/utils";

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
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
          {/* Header Content */}
          <div className="space-y-4 text-center">
            {subheading && (
              <span className="text-primary font-bold uppercase tracking-wider text-sm block">
                {subheading}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {heading}
            </h2>
          </div>

          {/* Centered Image Just Below Heading */}
          {image && (
            <div className="w-full max-w-3xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={resolveMediaUrl(image)}
                  alt={imageAlt || heading}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="w-full mt-4">
            <div
              className="prose prose-lg text-foreground-muted max-w-none [&>*]:[unicode-bidi:plaintext] [&>*]:text-start"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
