"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Newspaper, ArrowRight } from "lucide-react";

type BookRecord = {
    id: string;
    title: string;
    fileUrl: string | null;
    coverImage: string | null; // Changed from imageUrl to match schema
    slug: string;
};

type MagazineRecord = {
    id: string;
    title: string;
    fileUrl: string | null;
    coverImage: string | null; // Changed from imageUrl to match schema
    slug: string;
    issueNumber: string | null;
};

type PublicationsProps = {
    booksData: BookRecord[];
    magazinesData: MagazineRecord[];
};

export function PublicationsGrid({ booksData, magazinesData }: PublicationsProps) {
    return (
        <div className="bg-[#fefefc]">
            {/* 1. Our Magazines Section */}
            <section className="py-20 border-t border-border bg-gradient-to-b from-white to-[#fefefc]">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-black text-[#0d5844] tracking-tight leading-tight">— Our Magazines</h2>
                            <p className="text-foreground-muted font-medium text-lg leading-relaxed max-w-2xl">
                                Books And Literature Of Tanzeem-e-Islami & Anjuman Khuddam Ul Quran
                            </p>
                        </div>
                        <Link href="/resources/magazines" className="group flex items-center gap-2 bg-[#fefefc] border-2 border-primary/10 px-8 py-3 rounded-2xl text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm">
                            About Magazines
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                                    <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                                    <div className="relative w-[240px] h-[332px] rounded-2xl overflow-hidden border border-border bg-white shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 ring-4 ring-white/50 group-hover:ring-primary/10">
                                        {mag.coverImage ? (
                                            <img src={mag.coverImage} alt={mag.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                                                <Newspaper className="w-12 h-12 text-primary/20" />
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        {/* Issue Number Badge - overlaid on image */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 py-2">
                                            <p className="text-xs font-bold italic text-white/90 text-center tracking-wide drop-shadow-sm">
                                                {mag.issueNumber || "Current Issue"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center z-10 w-full px-4">
                                    <Link
                                        href={`/resources/magazines/${mag.id}`}
                                        className="inline-flex items-center justify-center gap-2 w-full bg-transparent border-2 border-primary text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-[#fefefc] transition-all duration-300 group/btn shadow-sm hover:shadow-md"
                                    >
                                        {mag.title}
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                            </motion.div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="w-[240px] h-[332px] mx-auto bg-muted/30 animate-pulse rounded-2xl border border-border"></div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 2. Our Books Section */}
            <section className="py-20 border-t border-border bg-white">
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-black text-[#0d5844] tracking-tight leading-tight">— Our Books</h2>
                            <p className="text-foreground-muted font-medium text-lg leading-relaxed max-w-2xl">
                                Message of Iqamat ud Din & Ruju llul Quran Through Our Periodicals.
                            </p>
                        </div>
                        <Link href="/resources/books" className="group flex items-center gap-2 bg-[#fefefc] border-2 border-[#0d5844]/10 px-8 py-3 rounded-2xl text-sm font-bold hover:bg-[#0d5844] hover:text-[#fefefc] hover:border-[#0d5844] transition-all duration-300 shadow-sm">
                            About Books
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                                    <div className="absolute -inset-4 bg-[#0d5844]/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                                    <div className="relative w-[240px] h-[332px] rounded-2xl overflow-hidden border border-border bg-white shadow-lg group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 ring-4 ring-white/50 group-hover:ring-[#0d5844]/10">
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                                                <BookOpen className="w-12 h-12 text-[#0d5844]/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                </div>

                                <div className="text-center z-10 w-full px-4">
                                    <Link
                                        href={`/resources/books/${book.id}`}
                                        className="inline-flex items-center justify-center gap-2 w-full bg-transparent border-2 border-[#0d5844] text-[#0d5844] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0d5844] hover:text-[#fefefc] transition-all duration-300 group/btn shadow-sm hover:shadow-md"
                                    >
                                        {book.title}
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="w-[240px] h-[332px] mx-auto bg-muted/30 animate-pulse rounded-2xl border border-border"></div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
