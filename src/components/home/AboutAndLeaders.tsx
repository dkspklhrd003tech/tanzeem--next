"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TeamMember = {
    id: string;
    name: string;
    designation: string | null;
    bio: string | null;
    avatar: string | null;
    slug: string;
};

type AboutProps = {
    team: TeamMember[];
    settings: Record<string, string>;
};

export function AboutAndLeaders({ team, settings }: AboutProps) {
    const aboutTitle =
        settings["homepage_about_title"] || "Tanzeem-e-Islami";
    const aboutDesc =
        settings["homepage_about_description"] ||
        "It is not enough to practice Islam in one\u2019s individual life but that the teachings of the Qur\u2019an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life. The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal.";
    const btnText =
        settings["homepage_about_button_text"] || "Read More";
    const btnLink =
        settings["homepage_about_button_link"] || "/organization";
    const aboutImage =
        settings["homepage_about_image"] || "/media/logo-dark.png";

    return (
        <section aria-labelledby="about-heading" className="py-14 bg-background">
            <div className="container max-w-7xl mx-auto px-4">

                {/* ── About Card — white bg, green left border accent (matches tanzeem.org) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-[#0d5844] border border-border rounded-xl mb-14 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start shadow-sm"
                >
                    {/* Logo Panel */}
                    <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 border-2 border-primary rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img
                            src={aboutImage}
                            alt="Tanzeem-e-Islami logo"
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                                const t = e.currentTarget;
                                if (!t.src.includes("/logo.png")) t.src = "/logo.png";
                                else t.style.display = "none";
                            }}
                        />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <p className="text-white mb-2 text-xs">About Us</p>
                        <h2
                            id="about-heading"
                            className="text-2xl md:text-3xl font-bold text-white mb-3"
                        >
                            {aboutTitle}
                        </h2>
                        <p className="text-white leading-relaxed text-sm md:text-base mb-6 max-w-3xl">
                            {aboutDesc}
                        </p>
                        <div>
                            <Link
                                href={btnLink}
                                className={cn(
                                    "inline-flex items-center gap-2 border border-white bg-primary text-white",
                                    "px-6 py-2.5 rounded-full text-sm font-semibold",
                                    "hover:bg-white hover:text-primary transition-colors",
                                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                )}
                            >
                                {btnText}
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* ── Leader Cards ── */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    role="list"
                    aria-label="Leadership team"
                >
                    {team.length > 0 ? (
                        team.map((leader, i) => (
                            <motion.div
                                key={leader.id}
                                role="listitem"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
                            >
                                {/* Photo */}
                                <div className="w-full md:w-44 aspect-square rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                                    {leader.avatar ? (
                                        <img
                                            src={leader.avatar}
                                            alt={leader.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            aria-hidden="true"
                                        >
                                            <User className="w-12 h-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">
                                            {leader.designation || "Leader"}
                                        </p>
                                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                                            {leader.name}
                                        </h3>
                                        {leader.bio && (
                                            <p className="text-foreground-muted text-sm leading-relaxed line-clamp-4">
                                                {leader.bio}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <Link
                                            href={`/${leader.slug}`}
                                            className={cn(
                                                "inline-flex items-center gap-2 bg-transparent border border-primary text-primary",
                                                "px-4 py-2 rounded-full text-xs font-bold",
                                                "hover:bg-primary hover:text-primary-foreground",
                                                "transition-all duration-200",
                                                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                            )}
                                        >
                                            {leader.designation?.toLowerCase().includes("founder")
                                                ? "About Founder"
                                                : "Learn More"}
                                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        /* Skeleton fallbacks */
                        [0, 1].map((i) => (
                            <div
                                key={i}
                                className="bg-card border border-border rounded-xl p-6 shadow-sm flex animate-pulse gap-6"
                                aria-hidden="true"
                            >
                                <div className="w-44 aspect-square bg-muted rounded-lg shrink-0" />
                                <div className="flex-1 space-y-4 py-2">
                                    <div className="h-3 bg-muted rounded w-1/4" />
                                    <div className="h-6 bg-muted rounded w-3/4" />
                                    <div className="h-16 bg-muted rounded w-full" />
                                    <div className="h-8 bg-muted rounded w-28" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
