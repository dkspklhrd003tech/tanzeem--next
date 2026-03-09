"use client";

import { motion } from "framer-motion";
import { BookOpen, Layers } from "lucide-react";
import Link from "next/link";

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
};

type Props = {
    booksData: BookRecord[];
    magazinesData: MagazineRecord[];
};

export function PublicationsGrid({ booksData, magazinesData }: Props) {
    if (!booksData.length && !magazinesData.length) return null;

    return (
        <section className="py-20 bg-muted/30">
            <div className="container max-w-7xl mx-auto px-4">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-primary font-bold tracking-wider uppercase mb-2 text-sm">Library</p>
                    <h2 className="text-3xl md:text-5xl font-black text-foreground">Featured Publications</h2>
                    <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Books Column */}
                    {booksData.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                    Books
                                </h3>
                                <Link href="/books" className="text-sm font-medium hover:text-primary transition-colors text-foreground-muted">View All</Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {booksData.map((book, i) => (
                                    <motion.div
                                        key={book.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group"
                                    >
                                        <Link href={`/books/${book.slug}`} className="block overflow-hidden rounded-xl shadow-sm bg-card aspect-[3/4] mb-3 relative border border-border">
                                            {book.coverImage ? (
                                                <img
                                                    src={book.coverImage}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-medium p-4 text-center">
                                                    No Cover
                                                </div>
                                            )}
                                        </Link>
                                        <Link href={`/books/${book.slug}`} className="block">
                                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2">{book.title}</h4>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Magazines Column */}
                    {magazinesData.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                                    <Layers className="w-6 h-6 text-primary" />
                                    Magazines
                                </h3>
                                <Link href="/magazines" className="text-sm font-medium hover:text-primary transition-colors text-foreground-muted">View All</Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {magazinesData.map((mag, i) => (
                                    <motion.div
                                        key={mag.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group"
                                    >
                                        <Link href={`/magazines/${mag.slug}`} className="block overflow-hidden rounded-xl shadow-sm bg-card aspect-[3/4] mb-3 relative border border-border">
                                            {mag.coverImage ? (
                                                <img
                                                    src={mag.coverImage}
                                                    alt={mag.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-medium p-4 text-center">
                                                    No Cover
                                                </div>
                                            )}
                                        </Link>
                                        <Link href={`/magazines/${mag.slug}`} className="block">
                                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2">{mag.title}</h4>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
