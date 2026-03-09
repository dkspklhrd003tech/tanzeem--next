"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

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
    const missionText = settings["homepage_mission_text"] || "Establish an Islamic State based on socio-political-economic Principles of Islam.";

    return (
        <section className="bg-background">

            {/* 1. Mission Banner (Full Width) */}
            <div className="bg-primary py-16 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply pointer-events-none"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

                <div className="container max-w-5xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-white/60 font-semibold tracking-wider uppercase mb-4 text-sm">Our Mission</p>
                        <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white leading-snug md:leading-tight">
                            "{missionText}"
                        </h2>
                    </motion.div>
                </div>
            </div>

            {/* 2. Featured Videos Grid */}
            {videos.length > 0 && (
                <div className="py-20">
                    <div className="container max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <p className="text-primary font-bold tracking-wider uppercase mb-2 text-sm">Media & Broadcasts</p>
                                <h2 className="text-3xl md:text-4xl font-black text-foreground">Featured Videos</h2>
                            </div>
                            <div className="w-16 h-1 bg-primary rounded-full hidden md:block mb-3"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {videos.map((vid, i) => (
                                <motion.div
                                    key={vid.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group cursor-pointer flex flex-col h-full"
                                    onClick={() => window.open(vid.videoUrl, '_blank')}
                                >
                                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted shadow-sm group-hover:shadow-xl transition-all mb-4">
                                        {vid.thumbnailUrl ? (
                                            <img
                                                src={vid.thumbnailUrl}
                                                alt={vid.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10">
                                                <PlayCircle className="w-12 h-12 text-muted-foreground/30" />
                                            </div>
                                        )}

                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-110 transition-transform pl-1 backdrop-blur-sm">
                                                <PlayCircle className="w-7 h-7" />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm leading-relaxed px-1">
                                        {vid.title}
                                    </h3>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}
