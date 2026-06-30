"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, PlayCircle, X, Headphones, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  title: string;
  mediaUrl: string;
  description?: string;
  code?: string;
}

interface SubCategory {
  id: string;
  title: string;
  image?: string;
  code?: string;
  mediaItems: MediaItem[];
}

interface MainCategory {
  id: string;
  title: string;
  code?: string;
  subCategories: SubCategory[];
}

interface NestedCategoryGridProps {
  heading?: string;
  style?: "capsule" | "image_card";
  categories: MainCategory[];
}

export function NestedCategoryGrid({ heading, style = "capsule", categories = [] }: NestedCategoryGridProps) {
  const [activeTabId, setActiveTabId] = useState<string>(categories[0]?.id || "");
  const [activeSubCat, setActiveSubCat] = useState<SubCategory | null>(null);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const activeMainCat = categories.find(c => c.id === activeTabId) || categories[0];

  return (
    <section className="bg-background relative overflow-hidden">
      <div className="container mx-auto relative z-10">

        {!activeSubCat ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Tabs Row */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {categories.map((main) => (
                <button
                  key={main.id}
                  onClick={() => setActiveTabId(main.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTabId === main.id
                    ? "bg-primary text-white shadow-md scale-100"
                    : "bg-muted text-primary hover:bg-primary/20 hover:text-primary"
                    }`}
                >
                  {main.code ? `${main.code} | ${main.title}` : main.title}
                </button>
              ))}
            </div>

            {/* Sub Categories Grid */}
            {activeMainCat && (
              <>
                {style === "capsule" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                    {activeMainCat.subCategories.map((sub, i) => (
                      <button
                        key={sub.id || i}
                        onClick={() => setActiveSubCat(sub)}
                        className="w-full text-left py-4 px-6 rounded-full border-2 border-primary/40 hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-between shadow-sm hover:shadow-md"
                      >
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {sub.code ? `${sub.code} | ${sub.title}` : sub.title}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                          {sub.mediaItems?.length || 0} items
                        </span>
                      </button>
                    ))}
                    {activeMainCat.subCategories.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground">
                        No sub-categories available in this category yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {activeMainCat.subCategories.map((sub, i) => (
                      <button
                        key={sub.id || i}
                        onClick={() => setActiveSubCat(sub)}
                        className="group relative rounded-2xl overflow-hidden aspect-video bg-muted border border-border hover:shadow-xl transition-all shadow-md flex flex-col text-left"
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                        {sub.image ? (
                          <img src={sub.image} alt={sub.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Video className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                          <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md">
                            {sub.code ? `${sub.code} | ${sub.title}` : sub.title}
                          </h3>
                          <p className="text-white/80 text-xs mt-1">
                            {sub.mediaItems?.length || 0} episodes
                          </p>
                        </div>
                      </button>
                    ))}
                    {activeMainCat.subCategories.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground">
                        No videos available in this category yet.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground">
                {activeSubCat.code ? `${activeSubCat.code} | ` : ""}{activeSubCat.title}
              </h2>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <ul className="divide-y divide-border">
                {activeSubCat.mediaItems?.map((item, i) => (
                  <li key={item.id || i} className="group hover:bg-muted/50 transition-colors">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                          {style === "image_card" ? <Video className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {item.code ? `${item.code} | ` : ""}{item.title}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveMedia(item)}
                        className="shrink-0 w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Play className="w-4 h-4 mr-2" /> Play Now
                      </Button>
                    </div>
                  </li>
                ))}
                {(!activeSubCat.mediaItems || activeSubCat.mediaItems.length === 0) && (
                  <li className="p-12 text-center text-muted-foreground">
                    No media items found in this sub-category.
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      {/* Media Player Modal */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full relative"
            >
              <button
                onClick={() => setActiveMedia(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">
                    {activeMedia.code ? `${activeMedia.code} | ` : ""}{activeMedia.title}
                  </h3>
                </div>

                <div className="bg-muted rounded-xl overflow-hidden aspect-video flex items-center justify-center border">
                  {/* Basic Media Player rendering */}
                  {activeMedia.mediaUrl.includes('youtube.com') || activeMedia.mediaUrl.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full"
                      src={activeMedia.mediaUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      allowFullScreen
                    ></iframe>
                  ) : activeMedia.mediaUrl.endsWith('.mp4') || activeMedia.mediaUrl.endsWith('.webm') ? (
                    <video src={activeMedia.mediaUrl} controls className="w-full h-full" autoPlay />
                  ) : activeMedia.mediaUrl.endsWith('.mp3') || activeMedia.mediaUrl.endsWith('.wav') ? (
                    <audio src={activeMedia.mediaUrl} controls className="w-full max-w-md mx-auto" autoPlay />
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground mb-4">Cannot embed this media URL directly.</p>
                      <a href={activeMedia.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>

                {activeMedia.description && (
                  <p className="text-muted-foreground">{activeMedia.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
