"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // Don't render animations until mounted to prevent hydration errors
  if (!isMounted) {
    return (
      <main className=" bg-background flex items-center justify-center">
        <div className="text-center px-4 py-10">
          <div className="mb-8">
            <span className="text-8xl font-bold text-primary/20">404</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className=" bg-background flex items-center justify-center overflow-hidden relative" style={{ perspective: 1200 }}>
      <div className="text-center px-4 py-10 relative z-10 w-full max-w-2xl mx-auto">
        <motion.div
          className="mb-8 relative mx-auto w-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          {/* Layer 1: Deep shadow/ghost */}
          <span className="text-[10rem] md:text-[14rem] leading-none font-black text-primary/10 block absolute"
            style={{ transform: "translateZ(-80px)" }}>
            404
          </span>
          {/* Layer 2: Main Text */}
          <span className="text-[10rem] md:text-[14rem] leading-none font-black text-primary relative z-10"
            style={{ transform: "translateZ(40px)", textShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(13, 88, 68, 0.5)" }}>
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
            The page you are looking for does not exist or has been moved.
            Please check the URL or navigate back to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Search Site
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center opacity-20">
        <div className="w-[60vw] h-[60vw] bg-primary blur-[140px] rounded-full mix-blend-normal" />
      </div>
    </main>
  );
}
