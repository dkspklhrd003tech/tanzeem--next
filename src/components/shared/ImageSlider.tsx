"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ImageSliderProps {
  slides: { image: string; alt?: string }[];
}

export function ImageSlider({ slides }: ImageSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full relative group">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.alt || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {slides.length > 1 && (
          <>
            <div className="hidden md:block">
              <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background" />
              <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background" />
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    current === i + 1
                      ? "bg-primary w-6"
                      : "bg-white/60 hover:bg-white/90"
                  )}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}
