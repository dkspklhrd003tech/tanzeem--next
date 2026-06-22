"use client";

import { motion } from "framer-motion";
import { PlayCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

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

    return (
        <section aria-labelledby="videos-heading">

            {/* 1. Mission Banner (Full Width) */}
            <div className="bg-primary py-16 text-center shadow-xl relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" aria-hidden="true" />

                <div className="container max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-primary-foreground leading-tight md:leading-relaxed drop-shadow-sm">
                            &ldquo;{missionText}&rdquo;
                        </h2>
                    </motion.div>
                </div>
            </div>

            {/* 2. Featured Videos Grid — Spotlight-style layout */}
            <div className="py-16 border-t border-border/60 bg-card">
                <div className="container max-w-7xl mx-auto">

                    <div className="mb-12">
                        <p className="section-label mb-1">Featured</p>
                        <h2 id="videos-heading" className="text-3xl md:text-4xl font-bold text-foreground">
                            Regular Video Broadcasts
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {videos.length > 0 ? videos.map((vid, i) => {
                            const card = (
                                <>
                                    {/* Image Container — 348x195 aspect ratio */}
                                    <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: '348 / 195' }}>
                                        {vid.thumbnailUrl ? (
                                            <img
                                                src={vid.thumbnailUrl}
                                                alt={vid.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                                        {/* Play Button Overlay */}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300" aria-hidden="true">
                                            <Play className="w-5 h-5 text-primary fill-current" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col justify-center items-center text-center bg-card transition-colors duration-500">
                                        <h3 className="font-bold text-foreground text-lg md:text-xl line-clamp-2 leading-tight">
                                            {vid.title}
                                        </h3>
                                    </div>
                                </>
                            );

                            if (vid.videoUrl) {
                                return (
                                    <motion.a
                                        key={vid.id}
                                        href={vid.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${vid.title} \u2014 opens video in new tab`}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className={cn(
                                            "group relative flex flex-col rounded-[1rem] border border-border shadow-sm",
                                            "hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        {card}
                                    </motion.a>
                                );
                            }

                            return (
                                <motion.div
                                    key={vid.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="group relative flex flex-col rounded-[1rem] border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                                >
                                    {card}
                                </motion.div>
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
