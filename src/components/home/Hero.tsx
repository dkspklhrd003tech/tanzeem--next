"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Hero({ slidesData = [] }: { slidesData?: any[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const regionRef = useRef<HTMLElement>(null);

  const displaySlides = slidesData;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (displaySlides.length <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, displaySlides.length, isPaused]);

  // Pause auto-rotation when any focusable child within the carousel receives focus
  const handleFocusWithin = useCallback(() => setIsPaused(true), []);
  const handleBlurWithin = useCallback(() => setIsPaused(false), []);

  // Keyboard support: ArrowLeft/ArrowRight when carousel is focused
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    },
    [prevSlide, nextSlide]
  );

  if (!displaySlides.length) return null;

  // Track unique labels for pagination dots
  const slideLabels = displaySlides.map(
    (s, i) => s.title || `Slide ${i + 1}`
  );

  return (
    <section
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured announcements"
      aria-live="polite"
      onFocus={handleFocusWithin}
      onBlur={handleBlurWithin}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative w-full overflow-hidden bg-background-secondary flex justify-center focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
    >
      {/* Edge-to-Edge Hero Container */}
      <div className="relative w-full h-[200px] md:h-[auto] aspect-[1920/450] overflow-hidden group">

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            {displaySlides[current].linkUrl ? (
              <Link
                href={displaySlides[current].linkUrl}
                aria-label={`${displaySlides[current].title} — visit page`}
              >
                <img
                  src={displaySlides[current].imageUrl}
                  alt={displaySlides[current].title || ""}
                  loading={current === 0 ? "eager" : "lazy"}
                  // @ts-ignore
                  fetchpriority={current === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover cursor-pointer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                {!displaySlides[current].imageUrl && (
                  <div className="hidden w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold md:text-2xl">{displaySlides[current].title}</span>
                  </div>
                )}
              </Link>
            ) : (
              <>
                <img
                  src={displaySlides[current].imageUrl}
                  alt={displaySlides[current].title || ""}
                  loading={current === 0 ? "eager" : "lazy"}
                  // @ts-ignore
                  fetchpriority={current === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                {!displaySlides[current].imageUrl && (
                  <div className="hidden w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold md:text-2xl">{displaySlides[current].title}</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Announced slide title for screen readers */}
        <div className="sr-only" aria-live="off" aria-atomic="true">
          {slideLabels[current]}
        </div>

        {/* Navigation Arrows */}
        {displaySlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-12 md:h-12 bg-white/20 hover:bg-primary border border-primary hover:border-none backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:text-primary-foreground transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 z-10 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:opacity-100"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" aria-hidden="true" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-12 md:h-12 bg-white/20 hover:bg-primary border border-primary hover:border-none backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:text-primary-foreground transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 z-10 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:opacity-100"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" aria-hidden="true" />
            </button>

            {/* Pagination Dots — each hit area at least 24×24 (WCAG 2.5.8) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10" role="tablist" aria-label="Slides">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slide ${i + 1}: ${slideLabels[i]}`}
                  onClick={() => goToSlide(i)}
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    i === current
                      ? "bg-primary/90"
                      : "bg-white/50 hover:bg-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      i === current ? "w-2.5 h-2.5 bg-primary-foreground" : "w-1.5 h-1.5 bg-white/90"
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>

            {/* Pause indicator for screen readers */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {isPaused ? "Carousel paused" : "Carousel playing"}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
