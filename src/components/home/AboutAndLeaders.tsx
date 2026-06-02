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
    const aboutDesc = settings["homepage_about_description"] || "It is not enough to practice Islam in one's individual life but that the teachings of the Qur’an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life.The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal.";
    const btnText = settings["homepage_about_button_text"] || "About Tanzeem";
    const btnLink = settings["homepage_about_button_link"] || "/markaz-tanzeem";
    const aboutImage = settings["homepage_about_image"] || "/media/logo-dark.png";

    return (
        <section className="py-16 bg-white">
            <div className="container max-w-7xl mx-auto">

                {/* Top: Global Description in a Primary Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-[#0d5844] rounded-xl p-6 md:p-8 mb-16 text-[#fefefc] flex flex-col md:flex-row gap-8 items-center md:items-center"
                >
                    <div className="w-[185px] h-[185px] bg-[#fefefc] rounded-lg flex items-center justify-center shrink-0">
                        <img
                            src={aboutImage}
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                if (e.currentTarget.src !== "/logo.png") {
                                    e.currentTarget.src = "/logo.png";
                                }
                            }}
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="!text-[#fefefc] font-semibold tracking-wider uppercase mb-2 text-sm">— About Us</h1>
                        <h2 className="text-3xl md:text-4xl !text-[#fefefc] font-black mb-4">{aboutTitle}</h2>
                        <p className="!text-[#fefefc] leading-relaxed text-sm md:text-base max-w-5xl mb-8">
                            {aboutDesc}
                        </p>
                        <Link
                            href={btnLink}
                            className="inline-flex items-center gap-2 !text-[#fefefc] font-bold border border-[#fefefc] px-8 py-3 rounded-full transition-all active:scale-95"
                        >
                            {btnText} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Leader Cards / Team Members */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {team.length > 0 ? team.map((leader, i) => (
                        <motion.div
                            key={leader.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="bg-[#fefefc] border border-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row gap-6"
                        >
                            <div className="w-full md:w-48 aspect-square rounded-xl overflow-hidden shrink-0 bg-muted">
                                {leader.avatar ? (
                                    <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><User className="w-12 h-12 text-muted-foreground/30" /></div>
                                )}
                            </div>
                            <div className="flex flex-col justify-between">
                                <div>
                                    <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">— {leader.designation || "Leader"}</p>
                                    <h3 className="text-xl md:text-2xl font-black text-[#111111] mb-3">{leader.name}</h3>
                                    {leader.bio && (
                                        <p className="text-foreground text-sm leading-relaxed line-clamp-4">
                                            {leader.bio}
                                        </p>
                                    )}
                                </div>
                                {/* <div className="mt-4">
                                    <Link href={`/organization/${leader.slug}`} className="inline-flex items-center gap-2 bg-muted hover:bg-muted-dark py-2 rounded-full text-xs font-bold transition-colors">
                                        About {leader.name.split(' ')[0]} <ArrowRight className="w-3 h-3 ml-1" />
                                    </Link>
                                </div> */}
                                <div className="mt-4">
                                    <Link
                                        href={`/${leader.slug}`}
                                        className="inline-flex items-center gap-2 bg-transparent border border-[#0d5844] text-[#0d5844] px-3 py-2 rounded-full text-xs font-bold hover:bg-[#0d5844] hover:text-[#fefefc] hover:border-[#0d5844] transition-all duration-300"
                                    >
                                        {leader.designation?.toLowerCase().includes('founder') ? 'About Founder' : 'About Ameer'}
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        // Show Fallback Placeholders if empty so homepage doesn't look empty
                        <>
                            <div className="bg-[#fefefc] border border-border rounded-2xl p-6 md:p-8 shadow-sm flex animate-pulse gap-6">
                                <div className="w-32 h-32 md:w-48 md:h-48 bg-muted rounded-xl shrink-0"></div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-4 bg-muted rounded w-1/4"></div>
                                    <div className="h-8 bg-muted rounded w-3/4"></div>
                                    <div className="h-20 bg-muted rounded w-full"></div>
                                </div>
                            </div>
                            <div className="bg-[#fefefc] border border-border rounded-2xl p-6 md:p-8 shadow-sm flex animate-pulse gap-6">
                                <div className="w-32 h-32 md:w-48 md:h-48 bg-muted rounded-xl shrink-0"></div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-4 bg-muted rounded w-1/4"></div>
                                    <div className="h-8 bg-muted rounded w-3/4"></div>
                                    <div className="h-20 bg-muted rounded w-full"></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </section>
    );
}
