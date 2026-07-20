"use client";

import { cn, resolveMediaUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface IntroSectionProps {
  heading: string;
  subheading?: string;
  body: string;
  image?: string;
  imageAlt?: string;
  alignment?: "left" | "right" | "top" | "bottom";
  backgroundColor?: string;
  showButton?: boolean;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonNewTab?: boolean;
  imageWidth?: string;
}

export function IntroSection({
  heading,
  subheading,
  body,
  image,
  imageAlt,
  alignment = "top",
  backgroundColor = "transparent",
  showButton = false,
  buttonLabel = "",
  buttonUrl = "",
  buttonNewTab = false,
  imageWidth = "",
}: IntroSectionProps) {
  const isHorizontal = alignment === "left" || alignment === "right";

  const textContent = (
    <div className={cn("flex flex-col gap-4", isHorizontal ? "text-left" : "text-center mx-auto max-w-4xl")}>
      <div className="space-y-4">
        {subheading && (
          <span className={cn("text-primary font-bold uppercase tracking-wider text-sm block", !isHorizontal && "text-center")}>
            {subheading}
          </span>
        )}
        <h2 className={cn("text-2xl md:text-4xl font-bold text-foreground leading-tight", !isHorizontal && "text-center")}>
          {heading}
        </h2>
      </div>

      <div className="w-full mt-2">
        <div
          className={cn(
            "prose prose-lg text-foreground max-w-none [&>*]:[unicode-bidi:plaintext] [&>*]:text-justify",
            !isHorizontal && "mx-auto"
          )}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>

      {showButton && buttonLabel && buttonUrl && (
        <div className={cn("flex mt-4", isHorizontal ? "justify-end" : "justify-center")}>
          <Button asChild size="lg" className="rounded-full px-4 py-1 text-base font-semibold">
            <Link href={buttonUrl.startsWith("http") ? buttonUrl : buttonUrl} target={buttonNewTab || buttonUrl.startsWith("http") ? "_blank" : undefined} rel={buttonNewTab || buttonUrl.startsWith("http") ? "noopener noreferrer" : undefined}>
              {buttonLabel}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );

  const imageContent = image ? (
    <div className={cn("w-full flex", !isHorizontal ? "justify-center max-w-3xl mx-auto" : "justify-center")}>
      <div
        className="relative overflow-hidden w-full"
        style={imageWidth ? { maxWidth: `${imageWidth}px` } : undefined}
      >
        <img
          src={resolveMediaUrl(image)}
          alt={imageAlt || heading}
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0" />
      </div>
    </div>
  ) : null;

  return (
    <section
      className="py-8 md:py-10 overflow-hidden relative"
      style={{ backgroundColor }}
    >
      <div className="container px-4 mx-auto relative z-10">
        {isHorizontal ? (
          <div className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto",
          )}>
            {alignment === "left" ? (
              <>
                <div className="lg:col-span-5">
                  {imageContent}
                </div>
                <div className="lg:col-span-7">
                  {textContent}
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-7">
                  {textContent}
                </div>
                <div className="lg:col-span-5">
                  {imageContent}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-10 max-w-5xl mx-auto">
            {alignment === "top" ? (
              <>
                {imageContent}
                {textContent}
              </>
            ) : (
              <>
                {textContent}
                {imageContent}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
