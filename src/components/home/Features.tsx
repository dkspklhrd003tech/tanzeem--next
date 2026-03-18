"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const leaders = [
  {
    title: "Bani Tanzeem-e-Islami",
    name: "Dr. Israr Ahmed",
    nameUrdu: "ڈاکٹر اسرار احمد",
    role: "Founder (1932 – 2010)",
    description: "Dr. Israr Ahmed was a prominent Pakistani Islamic theologian, philosopher, and scholar who founded Tanzeem-e-Islami in 1975. His lifelong mission was the establishment of the Khilafah through the methodology of the Prophet Muhammad (SAWS).",
    href: "/organization/founder",
    initial: "ا",
  },
  {
    title: "Ameer Tanzeem-e-Islami",
    name: "Hafiz Aakif Saeed",
    nameUrdu: "حافظ آکف سعید",
    role: "Current Ameer",
    description: "Hafiz Aakif Saeed has been serving as the Ameer (leader) of Tanzeem-e-Islami since 2010, continuing the mission of Dr. Israr Ahmed and guiding the organization towards the establishment of the Islamic system.",
    href: "/organization/ameer",
    initial: "ح",
  },
];

export function Features() {
  return (
    <section className="py-14 bg-primary">
      <div className="container mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-white/60 text-sm font-semibold tracking-wider uppercase mb-1">— About Us</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Tanzeem-e-Islami
          </h2>
        </motion.div>

        {/* Leader Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaders.map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-[#fefefc] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
            >
              <div className="p-6 md:p-8">
                <p className="text-xs text-primary font-semibold tracking-wider uppercase mb-3">
                  {leader.title}
                </p>

                {/* Avatar / Initial */}
                <div className="flex items-start gap-5 mb-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0">
                    <span className="text-[#fefefc] text-4xl font-bold" style={{ fontFamily: "'Scheherazade New', serif" }}>
                      {leader.initial}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{leader.name}</h3>
                    <p className="text-foreground-muted text-sm" style={{ fontFamily: "'Scheherazade New', serif" }}>
                      {leader.nameUrdu}
                    </p>
                    <p className="text-xs text-primary font-medium mt-0.5">{leader.role}</p>
                  </div>
                </div>

                <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                  {leader.description}
                </p>

                <Link
                  href={leader.href}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all"
                >
                  About
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
