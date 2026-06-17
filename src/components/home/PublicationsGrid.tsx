"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Newspaper, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    return (
        <div>
            {/* 1. Our Magazines Section */}
            <section aria-labelledby="magazines-heading" className="py-16 border-t border-border bg-gradient-to-b from-card to-card">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                        <div className="space-y-3">
                            <h2 id="magazines-heading" className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight">&mdash; Our Magazines</h2>
                            <p className="text-foreground-muted font-medium text-lg leading-relaxed max-w-2xl">
                                Books And Literature Of Tanzeem-e-Islami &amp; Anjuman Khuddam Ul Quran
                            </p>
                        </div>
                        <Link
                            href="/magazines"
                            className={cn(
                                "group flex items-center gap-2 btn-primary-rounded px-8 py-3 text-sm font-bold shadow-sm",
                                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                            )}
                        >
                            About Magazines
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                        {magazinesData.length > 0 ? magazinesData.map((mag, i) => (
                            <motion.div
                                key={mag.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group flex flex-col items-center"
                            >
                                <div className="relative mb-6">
                                    {/* Glassmorphism background for card */}
                                    <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" aria-hidden="true" />

                                    <div className={cn(
                                        "relative w-[240px] h-[332px] rounded-2xl overflow-hidden border border-border bg-card shadow-lg",
                                        "group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500",
                                        "ring-4 ring-white/50 group-hover:ring-primary/10"
                                    )}>
                                        {mag.coverImage ? (
                                            <img src={mag.coverImage} alt={mag.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30" aria-hidden="true">
                                                <Newspaper className="w-12 h-12 text-primary/20" />
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="text-xs font-medium italic text-foreground/50 mb-4 line-clamp-1">
                                    {mag.issueNumber || "Current Issue"}
                                </div>

                                <div className="text-center z-10 w-full">
                                    <Link
                                        href={`/magazines/${mag.id}`}
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 w-full btn-primary-rounded px-6 py-2.5 text-xs font-semibold uppercase tracking-widest group/btn shadow-sm hover:shadow-md",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        More {mag.title}
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                                    </Link>
                                </div>

                            </motion.div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="w-[240px] h-[332px] mx-auto bg-muted/30 animate-pulse rounded-2xl border border-border" aria-hidden="true" />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 2. Our Books Section */}
            <section aria-labelledby="books-heading" className="py-16 border-t border-border bg-card">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                        <div className="space-y-3">
                            <h2 id="books-heading" className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-tight">&mdash; Our Books</h2>
                            <p className="text-foreground-muted font-medium text-lg leading-relaxed max-w-2xl">
                                Message of Iqamat ud Din &amp; Ruju llul Quran Through Our Periodicals.
                            </p>
                        </div>
                        <Link
                            href="/books"
                            className={cn(
                                "group flex items-center gap-2 btn-primary-rounded px-8 py-3 text-sm font-semibold shadow-sm",
                                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                            )}
                        >
                            About Books
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                        {booksData.length > 0 ? booksData.map((book, i) => (
                            <motion.div
                                key={book.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group flex flex-col items-center"
                            >
                                <div className="relative mb-6">
                                    <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" aria-hidden="true" />

                                    <div className={cn(
                                        "relative w-[240px] h-[332px] rounded-2xl overflow-hidden border border-border bg-card shadow-lg",
                                        "group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500",
                                        "ring-4 ring-white/50 group-hover:ring-primary/10"
                                    )}>
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30" aria-hidden="true">
                                                <BookOpen className="w-12 h-12 text-primary/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                                    </div>
                                </div>

                                <div className="text-center z-10 w-full">
                                    <Link
                                        href={`/books/${book.id}`}
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 w-full btn-primary-rounded px-6 py-2.5 text-xs font-semibold uppercase tracking-widest group/btn shadow-sm hover:shadow-md",
                                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                                        )}
                                    >
                                        {book.title}
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                                    </Link>
                                </div>
                            </motion.div>
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
