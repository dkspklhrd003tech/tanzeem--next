"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 rounded-full w-11 h-11 shadow-lg bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center transition-all duration-300"
            size="icon"
            aria-label="Back to top"
        >
            <ArrowUp className="w-7 h-7" />
        </Button>
    );
}
