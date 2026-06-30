"use client";

import { motion } from "framer-motion";
import { PlayCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type VideoRecord = {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string | null;
};

type MissionProps = {
    videos: VideoRecord[];
    settings: Record<string, string>;
};

export function MissionAndVideos({ videos, settings }: MissionProps) {
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

            const cards = gsap.utils.toArray(".video-card");
            gsap.fromTo(cards,
                { opacity: 0, y: 80, scale: 0.9, rotateY: 15 },
                {
                    opacity: 1, y: 0, scale: 1, rotateY: 0,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: { trigger: gridRef.current, start: "top 80%" }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} aria-labelledby="videos-heading" className="overflow-hidden perspective-1000">

            {/* 1. Mission Banner (Full Width) */}
            <div ref={missionRef} className="bg-primary/95 py-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" aria-hidden="true" />

                <div className="container max-w-5xl mx-auto relative z-10 px-4">
                    <div className="space-y-6">
                        <h2 ref={textRef} className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight md:leading-snug drop-shadow-lg tracking-tight">
                            &ldquo;{missionText}&rdquo;
                        </h2>
                    </div>
                </div>
            </div>

            {/* 2. Featured Videos Grid — Spotlight-style layout */}
            <div className="py-10 border-t border-border/20 bg-background relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-card/30 pointer-events-none" />
                <div className="container max-w-7xl mx-auto relative z-10">

                    <div className="mb-16 text-center">
                        <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Featured</p>
                        <h2 id="videos-heading" className="text-4xl md:text-5xl font-black text-foreground drop-shadow-sm">
                            Regular Video Broadcasts
                        </h2>
                    </div>

                    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {videos.length > 0 ? videos.map((vid, i) => {
                            const card = (
                                <>
                                    {/* Image Container — 348x195 aspect ratio */}
                                    <div className="relative w-full overflow-hidden bg-muted/30" style={{ aspectRatio: '348 / 195' }}>
                                        {vid.thumbnailUrl ? (
                                            <img
                                                src={vid.thumbnailUrl}
                                                alt={vid.title}
                                                className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-muted to-muted/30" aria-hidden="true">
                                                <PlayCircle className="w-12 h-12 text-primary/20 mb-4" />
                                                <span className="text-foreground/40 text-xs font-bold uppercase tracking-widest leading-tight border-l-2 border-primary/20">
                                                    Thumbnail Pending
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" aria-hidden="true" />

                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none z-20" aria-hidden="true">
                                            <div className="bg-primary/90 backdrop-blur-md p-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] text-white">
                                                <Play className="w-8 h-8 fill-current translate-x-0.5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col justify-center items-center text-center bg-card/60 backdrop-blur-md transition-colors duration-500 relative z-10">
                                        <h3 className="font-bold text-foreground text-lg md:text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-500">
                                            {vid.title}
                                        </h3>
                                    </div>
                                </>
                            );

                            if (vid.videoUrl) {
                                return (
                                    <a
                                        key={vid.id}
                                        href={vid.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${vid.title} \u2014 opens video in new tab`}
                                        className={cn(
                                            "video-card group relative flex flex-col rounded-[1.5rem] border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                                            "hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-3 transition-all duration-700 overflow-hidden",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        {card}
                                    </a>
                                );
                            }

                            return (
                                <div
                                    key={vid.id}
                                    className="video-card group relative flex flex-col rounded-[1.5rem] border border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 overflow-hidden"
                                >
                                    {card}
                                </div>
                            );
                        }) : (
                            // Premium Skeleton placeholders
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="flex flex-col h-full bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm animate-pulse" aria-hidden="true">
                                    <div className="w-full bg-muted" style={{ aspectRatio: '348 / 195' }} />
                                    <div className="p-8 space-y-3">
                                        <div className="h-5 bg-muted rounded-full w-3/4 mx-auto" />
                                        <div className="h-5 bg-muted rounded-full w-1/2 mx-auto" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </section>
    );
}
