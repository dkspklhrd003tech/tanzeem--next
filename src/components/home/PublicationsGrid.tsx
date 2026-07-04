"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Newspaper, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type BookRecord = {
    id: string;
    title: string;
    fileUrl: string | null;
    coverImage: string | null;
    slug: string;
};

type MagazineRecord = {
    id: string;
    title: string;
    fileUrl: string | null;
    coverImage: string | null;
    slug: string;
    issueNumber: string | null;
};

type PublicationsProps = {
    booksData: BookRecord[];
    magazinesData: MagazineRecord[];
};

export function PublicationsGrid({ booksData, magazinesData }: PublicationsProps) {
    const section1Ref = useRef<HTMLElement>(null);
    const section2Ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!section1Ref.current || !section2Ref.current) return;

        const ctx = gsap.context(() => {
            [section1Ref.current, section2Ref.current].forEach(sec => {
                if (!sec) return;
                const header = sec.querySelector(".pub-header");
                const cards = sec.querySelectorAll(".pub-card");

                gsap.fromTo(header,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 1, ease: "power3.out",
                        scrollTrigger: { trigger: sec, start: "top 80%" }
                    }
                );

                gsap.fromTo(cards,
                    { opacity: 0, y: 60, scale: 0.95, rotateY: 10 },
                    {
                        opacity: 1, y: 0, scale: 1, rotateY: 0,
                        duration: 1,
                        stagger: 0.15,
                        ease: "back.out(1.2)",
                        scrollTrigger: { trigger: sec, start: "top 70%" }
                    }
                );
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="bg-background px-6 overflow-hidden perspective-1000">
            {/* 1. Our Magazines Section */}
            <section ref={section1Ref} aria-labelledby="magazines-heading" className="relative py-10 border-t border-border/20">
                <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-background pointer-events-none" />
                <div className="container max-w-7xl mx-auto relative z-10">
                    <div className="pub-header flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                        <div>
                            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Our Magazines</p>
                            <h2 id="magazines-heading" className="spotlight_heading max-w-3xl">
                                Books And Literature Of Tanzeem-e-Islami &amp; Anjuman Khuddam Ul Quran
                            </h2>
                        </div>
                        <Link
                            href="/magazines"
                            className={cn(
                                "group inline-flex items-center gap-3 border border-primary/50 bg-primary text-primary-foreground backdrop-blur-md",
                                "px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg",
                                "hover:bg-primary hover:border-primary transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                            )}
                        >
                            About Magazines
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {magazinesData.length > 0 ? magazinesData.map((mag, i) => (
                            <div
                                key={mag.id}
                                className="pub-card group flex flex-col items-center"
                            >
                                <div className="relative mb-6">

                                    <div className={cn(
                                        "relative w-[180px] md:w-[260px] h-[auto] rounded-[1.5rem] overflow-hidden border border-border/50 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                                        "group-hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] group-hover:-translate-y-3 transition-all duration-700",
                                        "ring-1 ring-white/10 group-hover:ring-primary/30 group-hover:rotate-1"
                                    )}>
                                        {mag.coverImage ? (
                                            <img src={mag.coverImage} alt={mag.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30" aria-hidden="true">
                                                <Newspaper className="w-12 h-12 text-primary/20" />
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="text-xs font-medium italic text-foreground/50 mb-4 line-clamp-1">
                                    {mag.issueNumber || "Current Issue"}
                                </div>

                                <div className="text-center z-10 w-full">
                                    <Link
                                        href={`/magazines/${mag.slug}`}
                                        className={cn(
                                            "group inline-flex items-center gap-3 border border-primary/50 text-[#222222] hover:text-white backdrop-blur-md",
                                            "px-4 md:px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg",
                                            "hover:bg-primary hover:border-primary transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        More {mag.title}
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                                    </Link>
                                </div>

                            </div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="w-[240px] h-[332px] mx-auto bg-muted/30 animate-pulse rounded-2xl border border-border" aria-hidden="true" />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 2. Our Books Section */}
            <section ref={section2Ref} aria-labelledby="books-heading" className="relative py-10 border-t border-border/20 bg-background">
                <div className="absolute inset-0 bg-gradient-to-t from-card/30 to-background pointer-events-none" />
                <div className="container max-w-7xl mx-auto relative z-10">
                    <div className="pub-header flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                        <div>
                            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Our Books</p>
                            <h2 id="books-heading" className="spotlight_heading max-w-3xl">
                                Message of Iqamat ud Din &amp; Ruju llul Quran Through Our Periodicals.
                            </h2>
                        </div>
                        <Link
                            href="/books"
                            className={cn(
                                "group inline-flex items-center gap-3 border border-primary/50 bg-primary text-primary-foreground backdrop-blur-md",
                                "px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg",
                                "hover:bg-primary hover:border-primary transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                            )}
                        >
                            About Books
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {booksData.length > 0 ? booksData.map((book, i) => (
                            <div
                                key={book.id}
                                className="pub-card group flex flex-col items-center"
                            >
                                <div className="relative mb-6">
                                    <div className="absolute -inset-6 bg-primary/10 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" aria-hidden="true" />

                                    <div className={cn(
                                        "relative w-[180px] md:w-[260px] h-[auto] rounded-[1.5rem] overflow-hidden border border-border/50 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                                        "group-hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] group-hover:-translate-y-3 transition-all duration-700",
                                        "ring-1 ring-white/10 group-hover:ring-primary/30 group-hover:-rotate-1"
                                    )}>
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30" aria-hidden="true">
                                                <BookOpen className="w-12 h-12 text-primary/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="text-center z-10 w-full">
                                    <Link
                                        href={`/books/${book.slug}`}
                                        className={cn(
                                            "group inline-flex items-center gap-3 border border-primary/50  text-[#222222] hover:text-white ackdrop-blur-md",
                                            "px-4 md:px-8 py-3.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg",
                                            "hover:bg-primary hover:border-primary transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        {book.title}
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="w-[240px] h-[332px] mx-auto bg-muted/30 animate-pulse rounded-2xl border border-border" aria-hidden="true" />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
