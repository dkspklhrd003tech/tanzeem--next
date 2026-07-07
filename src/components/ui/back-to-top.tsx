"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
            const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;

            if (winHeightPx > 0) {
                const progress = (scrollPx / winHeightPx) * 100;
                setScrollProgress(progress);
            } else {
                setScrollProgress(0);
            }

            // Show button when page is scrolled down
            if (scrollPx > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        // Initial call
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>

            {/* Back to Top Button */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 z-50 transition-all duration-500 transform",
                    isVisible ? "translate-y-0 opacity-100 visible" : "translate-y-10 opacity-0 invisible"
                )}
            >

                <button
                    onClick={scrollToTop}
                    className="relative group w-14 h-14 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors focus:outline-none"
                    aria-label="Back to top"
                >
                    {/* Water Level Wave Animation */}
                    <div
                        className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-150 ease-out flex items-center justify-center overflow-hidden z-0"
                        style={{ height: `${scrollProgress}%` }}
                    >
                        {/* Wave elements */}
                        <div className="absolute top-[-10px] w-[200%] h-[20px] -left-1/2">
                            <svg viewBox="0 0 1440 320" className="absolute w-full h-full text-primary fill-current opacity-70 animate-[wave_3s_linear_infinite]">
                                <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,133.3C672,128,768,160,864,170.7C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                            <svg viewBox="0 0 1440 320" className="absolute w-full h-full text-primary fill-current animate-[wave_4s_linear_infinite_reverse]">
                                <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Icon */}
                    <ArrowUp className={cn(
                        "w-6 h-6 z-10 transition-colors duration-300",
                        scrollProgress > 50 ? "text-white" : "text-primary group-hover:text-primary"
                    )} />
                </button>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </>
    );
}
