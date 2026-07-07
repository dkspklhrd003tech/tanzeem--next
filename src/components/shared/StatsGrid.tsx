"use client";

import { motion } from "framer-motion";

interface StatItem {
  number: string;
  label: string;
  icon?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  backgroundColor?: string;
  textColor?: string;
}

export function StatsGrid({ stats, backgroundColor = "#005031", textColor = "#ffffff" }: StatsGridProps) {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl" />

      <div className="container px-4 py-6 mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center space-y-2"
            >
              <div
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
                style={{ color: textColor }}
              >
                {stat.number}
              </div>
              <div
                className="text-sm md:text-base font-medium uppercase tracking-widest opacity-80"
                style={{ color: textColor }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
