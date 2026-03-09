"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type HomeCampaign = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
};

export function SpotlightCampaigns({ campaigns }: { campaigns: HomeCampaign[] }) {
    if (!campaigns || campaigns.length === 0) return null;

    return (
        <section className="py-16 bg-background">
            <div className="container max-w-7xl mx-auto px-4">

                <div className="text-center max-w-2xl mx-auto mb-12">
                    <p className="text-primary font-bold tracking-wider uppercase mb-2 text-sm">Campaigns</p>
                    <h2 className="text-3xl md:text-5xl font-black text-foreground">Spotlight Highlights</h2>
                    <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, i) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted shadow-sm hover:shadow-xl transition-all block cursor-pointer"
                            onClick={() => {
                                if (campaign.linkUrl) {
                                    window.open(campaign.linkUrl, '_blank');
                                }
                            }}
                        >
                            <img
                                src={campaign.imageUrl}
                                alt={campaign.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-xl md:text-2xl drop-shadow-md mb-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    {campaign.title}
                                </h3>

                                {campaign.linkUrl && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary-light font-medium text-sm">
                                        View Campaign <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
