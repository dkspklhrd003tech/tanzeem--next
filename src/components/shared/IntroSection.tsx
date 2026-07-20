"use client";

import { cn, resolveMediaUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isLeaderPage = pathname === "/the-founder" || pathname === "/the-ameer";
  const isHorizontal = alignment === "left" || alignment === "right";

  if (isLeaderPage) {
    return (
      <section className="py-8 md:py-10 overflow-hidden relative bg-slate-50/50">
        <div className="container mx-auto px-4">
          {/* Centered Heading & Subheading */}
          <div className="text-center mb-8 pb-6 border-b border-slate-100">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              {heading}
            </h2>
            {subheading && (
              <h3 className="text-center text-primary font-bold uppercase tracking-wider text-sm md:text-base">
                {subheading}
              </h3>
            )}
          </div>

          {/* Floated Image + Body Content */}
          <div className="prose prose-lg prose-emerald max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground 
                    prose-h2:text-2xl prose-h2:pl-3 prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
                    prose-strong:text-foreground prose-strong:font-bold
                    prose-li:text-foreground prose-li:mb-2
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                    prose-blockquote:italic prose-blockquote:pl-6 prose-blockquote:text-foreground prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-2xl
                    [&>*]:[unicode-bidi:plaintext] [&>*]:text-start">
            {image && (
              <div className="w-full max-w-xs mx-auto md:ml-0 md:mr-8 md:float-left md:w-[320px] md:mb-4 mb-6">
                <img
                  src={resolveMediaUrl(image)}
                  alt={imageAlt || heading}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </div>

          {showButton && buttonLabel && buttonUrl && (
            <div className="flex mt-8 justify-center">
              <Button asChild size="lg" className="rounded-full px-4 py-1 text-base font-semibold">
                <Link href={buttonUrl.startsWith("http") ? buttonUrl : buttonUrl} target={buttonNewTab || buttonUrl.startsWith("http") ? "_blank" : undefined} rel={buttonNewTab || buttonUrl.startsWith("http") ? "noopener noreferrer" : undefined}>
                  {buttonLabel}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

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
