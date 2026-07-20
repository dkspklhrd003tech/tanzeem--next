"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type CampaignRecord = {
    id: string;
    title: string;
    linkUrl: string | null;
    imageUrl: string | null;
};

type MissionProps = {
    campaigns: CampaignRecord[];
    settings: Record<string, string>;
};

export function MissionAndCampaigns({ campaigns, settings }: MissionProps) {
    const missionText = settings["homepage_mission_text"] || "Establish an Islamic State based on socio-political-economic Principles of Islam on the lines of the one established by Prophet Muhammad (PBUH)";

    const sectionRef = useRef<HTMLElement>(null);
    const missionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !missionRef.current || !textRef.current || !gridRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(textRef.current,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "power4.out",
                    scrollTrigger: { trigger: missionRef.current, start: "top 75%" }
                }
            );

            const cards = gsap.utils.toArray(".campaign-card");
            if (cards.length > 0) {
                gsap.fromTo(cards,
                    { opacity: 0, y: 80, scale: 0.9, rotateY: 15 },
                    {
                        opacity: 1, y: 0, scale: 1, rotateY: 0,
                        duration: 1.2,
                        stagger: 0.1,
                        ease: "power3.out",
                        clearProps: "all",
                        scrollTrigger: { trigger: gridRef.current, start: "top 80%" }
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} aria-labelledby="campaigns-heading" className="overflow-hidden perspective-1000">

            {/* 1. Mission Banner (Full Width) */}
            <div ref={missionRef} className="bg-primary/95 py-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">

                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" aria-hidden="true" />

                <div className="max-w-3xl md:max-w-4xl mx-auto relative z-10 px-6 md:px-0 ">
                    <div className="space-y-6">
                        <h2 ref={textRef} className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight md:leading-snug drop-shadow-lg tracking-tight">
                            &ldquo;{missionText.replace(/<[^>]+>/g, '')}&rdquo;
                        </h2>
                    </div>
                </div>
            </div>

            {/* 2. Featured Campaigns Grid */}
            <div className="py-10 border-t border-border/20 bg-background relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-card/30 pointer-events-none" />
                <div className="container max-w-7xl mx-auto relative z-10 px-6">

                    <div className="mb-6 md:mb-8 text-center">
                        <h2 id="campaigns-heading" className="spotlight_heading">Featured Campaigns</h2>
                        <p className="text-foreground font-medium tracking-normal uppercase text-sm">
                            Regular Video Broadcasts
                        </p>
                    </div>

                    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {campaigns.length > 0 ? campaigns.slice(0, 8).map((camp, i) => {
                            const card = (
                                <div className="flex flex-col h-full bg-card/60 backdrop-blur-md rounded-[1.5rem] border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-primary/10 group-hover:border-primary/40 group-hover:bg-primary-light group-hover:-translate-y-3 transition-all duration-700 overflow-hidden relative group/inner">

                                    {/* Image Container */}
                                    <div className="relative w-full overflow-hidden bg-muted/50" style={{ aspectRatio: '348 / 195' }}>
                                        {camp.imageUrl ? (
                                            <img
                                                src={camp.imageUrl}
                                                alt={camp.title}
                                                className="w-full h-full object-cover group-hover/inner:scale-110 group-hover/inner:rotate-1 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-primary-light" aria-hidden="true">
                                                <ImageIcon className="w-12 h-12 text-foreground hover:text-primary mb-4" />
                                                <span className="text-foreground/40 text-xs font-bold uppercase tracking-widest leading-tight border-l-2 border-primary/20">
                                                    Preview Pending
                                                </span>
                                            </div>
                                        )}

                                        {/* Link Icon Overlay */}
                                        <div className="absolute top-4 right-4 bg-primary-light/40 hover backdrop-blur-md p-3 rounded-full transform translate-y-4 opacity-0 group-hover/inner:translate-y-0 group-hover/inner:opacity-100 transition-all duration-500 ease-out z-20" aria-hidden="true">
                                            <ArrowUpRight className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col justify-center items-center text-center transition-colors duration-500 relative z-20">
                                        <h3 className="font-bold text-foreground text-md md:text-lg line-clamp-2 leading-tight group-hover/inner:text-primary transition-colors duration-500">
                                            {camp.title}
                                        </h3>
                                    </div>
                                </div>
                            );

                            if (camp.linkUrl) {
                                return (
                                    <a
                                        key={camp.id}
                                        href={camp.linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${camp.title} \u2014 opens link`}
                                        className={cn(
                                            "campaign-card group relative flex flex-col",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        {card}
                                    </a>
                                );
                            }

                            return (
                                <div
                                    key={camp.id}
                                    className="campaign-card group relative flex flex-col"
                                >
                                    {card}
                                </div>
                            );
                        }) : null}
                    </div>
                </div>
            </div>

        </section>
    );
}
