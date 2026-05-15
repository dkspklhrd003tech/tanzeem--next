"use client";

import { motion } from "framer-motion";
import { PlayCircle, Play } from "lucide-react";

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
        <section className="bg-white">

            {/* 1. Mission Banner (Full Width) */}
            <div className="bg-[#0d5844] py-16 text-center shadow-xl relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                <div className="container max-w-5xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black !text-[#fefefc] leading-tight md:leading-relaxed drop-shadow-sm">
                            "{missionText}"
                        </h2>
                    </motion.div>
                </div>
            </div>

            {/* 2. Featured Videos Grid — Spotlight-style layout */}
            <div className="py-16 border-t border-border/60 bg-[#fefefc]">
                <div className="container max-w-7xl mx-auto">

                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-[#0d5844]">— Featured</h2>
                            <p className="text-primary font-semibold text-xl mt-2 max-w-xl leading-relaxed">
                                Regular Video Broadcasts
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {videos.length > 0 ? videos.map((vid, i) => (
                            <motion.div
                                key={vid.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative flex flex-col bg-white rounded-[1rem] border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer h-full"
                                onClick={() => window.open(vid.videoUrl, '_blank')}
                            >
                                {/* Image Container — 348x195 aspect ratio */}
                                <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: '348 / 195' }}>
                                    {vid.thumbnailUrl ? (
                                        <img
                                            src={vid.thumbnailUrl}
                                            alt={vid.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-muted to-muted/30">
                                            <PlayCircle className="w-12 h-12 text-primary/20 mb-4" />
                                            <span className="text-foreground/40 text-xs font-bold uppercase tracking-widest leading-tight border-l-2 border-primary/20">
                                                Thumbnail Pending
                                            </span>
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Play Button Overlay */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <Play className="w-5 h-5 text-primary fill-current" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col justify-center items-center text-center bg-white transition-colors duration-500">
                                    <h3 className="font-extrabold text-foreground text-lg md:text-xl line-clamp-2 leading-tight">
                                        {vid.title}
                                    </h3>
                                </div>
                            </motion.div>
                        )) : (
                            // Premium Skeleton placeholders
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex flex-col h-full bg-white rounded-[2rem] border border-border overflow-hidden shadow-sm animate-pulse">
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
