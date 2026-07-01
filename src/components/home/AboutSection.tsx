"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const spotlightItems = [
  { title: "Zamana Gawah Hai", type: "Video Series", icon: "🎬", color: "from-emerald-600 to-emerald-800" },
  { title: "Ameer Say Mulaqat", type: "Interview", icon: "🎤", color: "from-teal-600 to-teal-800" },
  { title: "Khitab-e-Jummah", type: "Weekly Sermon", icon: "🕌", color: "from-green-700 to-green-900" },
  { title: "Dars-e-Quran", type: "Quran Study", icon: "📖", color: "from-emerald-700 to-emerald-900" },
  { title: "Youth Wing", type: "Shabab Programs", icon: "🌟", color: "from-teal-700 to-teal-900" },
  { title: "Quarterly Meesaq", type: "Magazine", icon: "📰", color: "from-green-600 to-green-800" },
];

export function AboutSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="!text-center w-full text-primary text-sm font-semibold tracking-wider uppercase mb-1">
              — Tanzeem Spotlight
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Programs & Initiatives
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-[#0d5844] flex items-center justify-center text-[#0d5844] hover:bg-[#0d5844] hover:text-[#fefefc] hover:border-[#0d5844] transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-[#0d5844] flex items-center justify-center text-[#0d5844] hover:bg-[#0d5844] hover:text-[#fefefc] hover:border-[#0d5844] transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Scrollable Cards */}
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {spotlightItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="min-w-[280px] md:min-w-[300px] group cursor-pointer"
            >
              <div className={`relative bg-gradient-to-br ${item.color} rounded-xl overflow-hidden h-44`}>
                {/* Card content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <span className="text-4xl">{item.icon}</span>
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{item.type}</p>
                    <h3 className="text-[#fefefc] text-lg font-bold mt-0.5">{item.title}</h3>
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-5 w-5 text-[#fefefc] fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
