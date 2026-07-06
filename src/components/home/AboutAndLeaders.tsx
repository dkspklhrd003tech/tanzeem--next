"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CinematicBackground } from "./CinematicBackground";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

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

    const sectionRef = useRef<HTMLElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const leadersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !aboutRef.current || !leadersRef.current) return;

        const ctx = gsap.context(() => {
            // About Section Parallax & Reveal
            gsap.fromTo(aboutRef.current,
                { y: 100, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1,
                    duration: 1.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: aboutRef.current,
                        start: "top 85%",
                    }
                }
            );

            // Leaders Staggered Reveal
            const cards = gsap.utils.toArray(".leader-card");
            gsap.fromTo(cards,
                { y: 50, opacity: 0, rotateX: -15 },
                {
                    y: 0, opacity: 1, rotateX: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: leadersRef.current,
                        start: "top 80%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} aria-labelledby="about-heading" className="relative px-6 py-8 md:py-20 overflow-hidden perspective-1000 bg-primary-light">
            {/* <CinematicBackground /> */}
            <div className="max-w-7xl mx-auto relative z-10">

                {/* ── About Card ── */}
                <div
                    ref={aboutRef}
                    className="relative mb-10 md:mb-20 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 transition-opacity duration-1000 pointer-events-none" />
                    {/* Logo Panel */}
                    <motion.div
                        className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)] relative z-10"
                    >
                        <img
                            src={aboutImage}
                            alt="Tanzeem-e-Islami logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                const t = e.currentTarget;
                                if (!t.src.includes("/logo.png")) t.src = "/logo.png";
                                else t.style.display = "none";
                            }}
                        />
                    </motion.div>

                    {/* Text Content */}
                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        <p className="sub_title">About Us</p>
                        <h2
                            id="about-heading"
                            className="text-2xl md:text-3xl font-bold mb-3"
                        >
                            {aboutTitle}
                        </h2>
                        <div 
                            className="text-[#222222] leading-relaxed text-sm md:text-base mb-6 prose prose-sm md:prose-base max-w-none prose-p:my-2"
                            dangerouslySetInnerHTML={{ __html: aboutDesc }}
                        />
                        <div>
                            <Link
                                href={btnLink}
                                className={cn(
                                    "inline-flex items-center gap-3 border border-primary/50 bg-primary text-primary-foreground backdrop-blur-md",
                                    "px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase",
                                    "hover:bg-primary hover:border-primary transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 group/btn"
                                )}
                            >
                                {btnText}
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Leader Cards ── */}
                <div
                    ref={leadersRef}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    role="list"
                    aria-label="Leadership team"
                >
                    {team.length > 0 ? (
                        team.map((leader, i) => (
                            <div
                                key={leader.id}
                                role="listitem"
                                className="leader-card group bg-white border border-border/50 rounded-2xl p-6 shadow-lg transition-all duration-700 flex flex-col md:flex-row gap-6 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-700 pointer-events-none" />
                                {/* Photo */}
                                <div className="w-full md:w-44 aspect-square rounded-xl overflow-hidden shrink-0 border border-white/2 relative z-10">
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
                                <div className="flex flex-col justify-between relative z-10">
                                    <div>
                                        <p className="sub_title">
                                            {leader.designation || "Leader"}
                                        </p>
                                        <h3 className="text-xl md:text-2xl font-bold text-[#222222] mb-3">
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
                                                "inline-flex items-center gap-2 bg-transparent border-1 border-![#222222] text-[#222222]",
                                                "px-4 py-2 rounded-full text-xs font-bold",
                                                "hover:bg-primary hover:text-primary-foreground",
                                                "transition-all duration-200",
                                                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                            )}
                                        >
                                            {leader.designation?.toLowerCase().includes("founder")
                                                ? "About Founder"
                                                : "About Ameer"}
                                            <ArrowRight className="w-3 h-3" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>
            </div>
        </section>
    );
}
