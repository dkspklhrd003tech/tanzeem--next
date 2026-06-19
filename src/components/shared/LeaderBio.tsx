"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderBioProps {
  name?: string;
  designation?: string;
  bio?: string;
  avatar?: string;
  readMoreUrl?: string;
  readMoreLabel?: string;
}

export function LeaderBio({
  name,
  designation,
  bio,
  avatar,
  readMoreUrl,
  readMoreLabel = "Read More",
}: LeaderBioProps) {
  if (!name && !bio) return null;

  return (
    <section className="py-14 bg-background">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-0">
            {/* Photo panel */}
            <div className="md:w-64 shrink-0 bg-muted flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border">
              <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-primary/20 bg-background">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name ?? "Leader photo"}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                    <User className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Content panel */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
              <div>
                {designation && (
                  <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">
                    {designation}
                  </p>
                )}
                {name && (
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {name}
                  </h2>
                )}
                {bio && (
                  <div
                    className="prose prose-base dark:prose-invert max-w-none
                      prose-p:text-foreground-muted prose-p:leading-relaxed
                      prose-headings:text-foreground prose-a:text-primary
                      prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: bio }}
                  />
                )}
              </div>

              {readMoreUrl && (
                <div>
                  <Link
                    href={readMoreUrl}
                    className={cn(
                      "inline-flex items-center gap-2 border border-primary text-primary",
                      "px-5 py-2 rounded-full text-sm font-semibold",
                      "hover:bg-primary hover:text-primary-foreground transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                    )}
                  >
                    {readMoreLabel}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
