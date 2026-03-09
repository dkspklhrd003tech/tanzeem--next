"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function Hero({ slidesData = [] }: { slidesData?: any[] }) {
  const [current, setCurrent] = useState(0);

  // Fallbacks in case database is empty or still initializing
  const fallbackSlides = [
    {
      id: "fallback-1",
      imageUrl: "/media/slide1.jpg",
      title: "Ramadan Special",
      linkUrl: "/events/ramadan"
    },
    {
      id: "fallback-2",
      imageUrl: "/media/slide2.jpg",
      title: "Tanzeem e Islami",
      linkUrl: "/organization/introduction"
    }
  ];

  const displaySlides = slidesData.length > 0 ? slidesData : fallbackSlides;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % displaySlides.length);
  }, [displaySlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  }, [displaySlides.length]);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, displaySlides.length]);

  if (!displaySlides.length) return null;

  return (
    <section className="relative w-full overflow-hidden bg-background-secondary flex justify-center">
      {/* Edge-to-Edge Hero Container */}
      <div className="relative w-full aspect-[1351/374] overflow-hidden group">

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {displaySlides[current].linkUrl ? (
              <Link href={displaySlides[current].linkUrl}>
                <img
                  src={displaySlides[current].imageUrl}
                  alt={displaySlides[current].title}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </Link>
            ) : (
              <img
                src={displaySlides[current].imageUrl}
                alt={displaySlides[current].title}
                className="w-full h-full object-cover"
              />
            )}

            {/* If the image ever fails to load or is pure fallback without actual string paths, show a placeholder block */}
            {!displaySlides[current].imageUrl && (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold md:text-2xl">{displaySlides[current].title}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {displaySlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                    }`}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
