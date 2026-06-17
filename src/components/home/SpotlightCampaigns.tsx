"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeCampaign = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
};

export function SpotlightCampaigns({ campaigns }: { campaigns: HomeCampaign[] }) {
    return (
        <section aria-labelledby="spotlight-heading" className="py-16 bg-card border-t border-border/60">
            <div className="container max-w-7xl mx-auto">

                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 id="spotlight-heading" className="text-4xl md:text-5xl font-black text-primary">Tanzeem Spotlight</h2>
                        <p className="text-primary font-semibold text-xl mt-2 max-w-xl leading-relaxed">
                            Campaigns, Announcements & Events
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns.length > 0 ? campaigns.map((campaign, i) => {
                        const card = (
                            <div className="flex flex-col h-full bg-card rounded-[1rem] border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full">
                                {/* Image Container - Strictly 348x195 aspect ratio compatible */}
                                <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: '348 / 195' }}>
                                    {campaign.imageUrl ? (
                                        <img
                                            src={campaign.imageUrl}
                                            alt={campaign.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-muted to-muted/30" aria-hidden="true">
                                            <Target className="w-12 h-12 text-primary/20 mb-4" />
                                            <span className="text-foreground/40 text-xs font-bold uppercase tracking-widest leading-tight border-l-2 border-primary/20">
                                                Visual Preview Pending
                                            </span>
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />

                                    {/* Link Icon Overlay */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300" aria-hidden="true">
                                        <ArrowUpRight className="w-5 h-5 text-primary" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col justify-center items-center text-center bg-card transition-colors duration-500">
                                    <h3 className="font-extrabold text-foreground text-lg md:text-xl line-clamp-2 leading-tight">
                                        {campaign.title}
                                    </h3>
                                </div>
                            </div>
                        );

                        if (campaign.linkUrl) {
                            return (
                                <motion.a
                                    key={campaign.id}
                                    href={campaign.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${campaign.title} \u2014 opens in new tab`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className={cn(
                                        "group relative flex flex-col rounded-[1rem] overflow-hidden",
                                        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                    )}
                                >
                                    {card}
                                </motion.a>
                            );
                        }

                        return (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative flex flex-col rounded-[1rem] overflow-hidden cursor-default"
                            >
                                {card}
                            </motion.div>
                        );
                    }) : (
                        // Premium Skeleton placeholders
                        Array(3).fill(0).map((_, i) => (
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
        </section>
    );
}
