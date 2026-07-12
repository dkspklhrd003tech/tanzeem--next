"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type HomeCampaign = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    openInNewTab?: boolean;
};

export function SpotlightCampaigns({ campaigns }: { campaigns: HomeCampaign[] }) {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !headerRef.current || !gridRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 1, ease: "power3.out",
                    scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
                }
            );

            const cards = gsap.utils.toArray(".campaign-card");
            gsap.fromTo(cards,
                { opacity: 0, y: 100, scale: 0.9, rotateX: 20 },
                {
                    opacity: 1, y: 0, scale: 1, rotateX: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "expo.out",
                    clearProps: "all",
                    scrollTrigger: { trigger: gridRef.current, start: "top 75%" }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} aria-labelledby="spotlight-heading" className="py-8 md:py-10 px-6 bg-background border-t border-border/20 perspective-1000 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
            <div className="container max-w-7xl mx-auto relative z-10">

                <div ref={headerRef} className="mb-6 md:mb-10 text-center">
                    <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Tanzeem Spotlight</p>
                    <h2 id="spotlight-heading" className="spotlight_heading">
                        Campaigns &amp; Events
                    </h2>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.length > 0 ? campaigns.map((campaign, i) => {
                        const card = (
                            <div className="flex flex-col h-full bg-card/60 backdrop-blur-md rounded-[1.5rem] border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-primary/10 group-hover:border-primary/40 group-hover:bg-primary-light group-hover:-translate-y-3 transition-all duration-700 overflow-hidden relative group/inner">

                                {/* Image Container */}
                                <div className="relative w-full overflow-hidden bg-muted/50" style={{ aspectRatio: '348 / 195' }}>
                                    {campaign.imageUrl ? (
                                        <img
                                            src={campaign.imageUrl}
                                            alt={campaign.title}
                                            className="w-full h-full object-cover group-hover/inner:scale-110 group-hover/inner:rotate-1 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-primary-light" aria-hidden="true">
                                            <Target className="w-12 h-12 text-foreground hover:text-primary mb-4" />
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
                                        {campaign.title}
                                    </h3>
                                </div>
                            </div>
                        );

                        if (campaign.linkUrl) {
                            return (
                                <a
                                    key={campaign.id}
                                    href={campaign.linkUrl}
                                    target={campaign.openInNewTab ? "_blank" : "_self"}
                                    rel={campaign.openInNewTab ? "noopener noreferrer" : undefined}
                                    aria-label={campaign.openInNewTab ? `${campaign.title} \u2014 opens in new tab` : campaign.title}
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
                                key={campaign.id}
                                className="campaign-card group relative flex flex-col cursor-default"
                            >
                                {card}
                            </div>
                        );
                    }) : null}
                </div>

            </div>
        </section>
    );
}
