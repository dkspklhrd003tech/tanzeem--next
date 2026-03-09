"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

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
    // Extract custom settings or fallback to defaults
    const aboutTitle = settings["homepage_about_title"] || "Tanzeem-e-Islami";
    const aboutDesc = settings["homepage_about_description"] || "Establish an Islamic State based on the Quran and Sunnah.";
    const btnText = settings["homepage_about_button_text"] || "About Tanzeem";
    const btnLink = settings["homepage_about_button_link"] || "/markaz-tanzeem";

    return (
        <section className="py-16 bg-muted/30">
            <div className="container max-w-7xl mx-auto px-4">

                {/* Top Split: Global Description vs CTA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-8 flex flex-col justify-center"
                    >
                        <p className="text-primary font-bold tracking-wider uppercase mb-2 text-sm">About Us</p>
                        <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                            {aboutTitle}
                        </h2>
                        <p className="text-foreground-muted text-lg leading-relaxed max-w-4xl whitespace-pre-wrap">
                            {aboutDesc}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 flex items-center lg:justify-end"
                    >
                        <Link
                            href={btnLink}
                            className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto overflow-hidden group relative"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant"></div>
                            {btnText}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Leader Cards / Team Members */}
                {team.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {team.map((leader, i) => (
                            <motion.div
                                key={leader.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-9xl leading-none text-primary pointer-events-none select-none">
                                    {leader.name.charAt(0)}
                                </div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-24 h-24 rounded-full border-4 border-muted overflow-hidden shrink-0 shadow-sm bg-muted flex items-center justify-center">
                                        {leader.avatar ? (
                                            <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-foreground mb-1">{leader.name}</h3>
                                        {leader.designation && (
                                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {leader.designation}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    {leader.bio && (
                                        <p className="text-foreground-muted leading-relaxed line-clamp-4 relative z-10">
                                            {leader.bio}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}
