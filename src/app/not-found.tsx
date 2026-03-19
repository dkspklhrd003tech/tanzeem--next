"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-grow flex items-center justify-center py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-8xl md:text-9xl font-bold text-primary opacity-20 mb-4 select-none">
                            404
                        </h1>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Page Not Found
                        </h2>
                        <p className="text-lg text-foreground-muted mb-8 max-w-xl mx-auto">
                            We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Return Home
                        </Link>

                        <div className="relative w-full sm:w-auto max-w-sm">
                            <input
                                type="text"
                                placeholder="Search Tanzeem..."
                                className="w-full px-4 py-3 pl-10 pr-12 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-16 pt-8 border-t border-border"
                    >
                        <p className="text-sm font-medium text-foreground-muted mb-4 uppercase tracking-wider">
                            Popular Pages
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                            <Link href="/about-us" className="text-foreground hover:text-primary transition-colors">About Us</Link>
                            <Link href="/organization/founder" className="text-foreground hover:text-primary transition-colors">Founder</Link>
                            <Link href="/resources/lectures" className="text-foreground hover:text-primary transition-colors">Lectures</Link>
                            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
