"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

const videoPrograms = [
  { title: "Zamana Gawah Hai", host: "Weekly Program", category: "Discussion" },
  { title: "Ameer Say Mulaqat", host: "Hafiz Aakif Saeed", category: "Interview" },
  { title: "Khitab-e-Jummah", host: "Friday Sermon", category: "Sermon" },
  { title: "Dars-e-Quran", host: "Quran Study Circle", category: "Education" },
];

export function LatestContent() {
  return (
    <>
      {/* Mission Banner */}
      <section className="py-8 md:py-8 bg-primary relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill-opacity='0.05'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-white/50 text-sm font-semibold tracking-wider uppercase mb-4">— Our Mission</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#fefefc] leading-relaxed mb-6">
              Working for the establishment of an Islamic state in Pakistan through
              peaceful, constitutional and democratic means
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Following the methodology prescribed by the Quran and Sunnah,
              and the model established by our beloved Prophet Muhammad (SAWS).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-14 bg-background-secondary pattern-bg">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-primary text-sm font-semibold tracking-wider uppercase mb-1">— Featured</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Video Programs
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videoPrograms.map((program, i) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-[#fefefc] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                      <Play className="h-6 w-6 text-[#fefefc] fill-[#fefefc] ml-0.5" />
                    </div>
                    <span className="absolute top-3 left-3 text-[10px] font-semibold bg-primary text-[#fefefc] px-2.5 py-0.5 rounded-full">
                      {program.category}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-foreground-muted text-sm">{program.host}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
