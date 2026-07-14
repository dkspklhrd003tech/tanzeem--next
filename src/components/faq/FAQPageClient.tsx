"use client";

import { useState } from "react";
import { Search, HelpCircle, BookOpen, Layers, Info, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FaqStyles } from "./FaqStyles";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

interface FAQPageClientProps {
  initialItems: FAQItem[];
  pageTitle?: string;
  pageExcerpt?: string;
}

// Check if string contains Urdu/Arabic characters
function isUrduText(text: string): boolean {
  const urduPattern = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return urduPattern.test(text);
}

export function FAQPageClient({ initialItems, pageTitle, pageExcerpt }: FAQPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategory = (cat?: string) => (cat === "General" ? "English" : cat) || "English";

  // Fixed categories list (User wants exactly these to always show)
  const categories = ["all", "English", "Urdu"];

  // Filter items based on search and category
  const filteredItems = initialItems.filter((item) => {
    const itemCat = getCategory(item.category).toLowerCase();
    const matchesCategory =
      selectedCategory === "all" ||
      itemCat === selectedCategory.toLowerCase() ||
      itemCat === "all";

    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // English first, then Urdu, then by order
    const catA = getCategory(a.category).toLowerCase();
    const catB = getCategory(b.category).toLowerCase();

    if (catA === 'english' && catB !== 'english') return -1;
    if (catA !== 'english' && catB === 'english') return 1;

    // Within the same category, sort by order
    return a.order - b.order;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryCount = (cat: string) => {
    if (cat === "all") return initialItems.length;
    return initialItems.filter((item) => getCategory(item.category).toLowerCase() === cat.toLowerCase()).length;
  };

  return (
    <div className="bg-background pb-10">
      <FaqStyles />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto -mt-20 relative z-20">
        {/* Search & Categories Bar */}
        <div className="bg-primary-light/80 border border-border/80 backdrop-blur-lg rounded-xl shadow-xl p-6 space-y-6">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search FAQs by keywords (e.g. Khilafah, membership, dars, etc.)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 justify-center overflow-x-auto pb-1.5 scrollbar-thin">
            {categories.map((cat) => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "text-xs md:text-sm px-4 py-2 rounded-full border font-medium transition-all whitespace-nowrap capitalize",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/50 text-primary border-primary/50 hover:bg-primary/70 hover:text-white"
                  )}
                >
                  {cat === "all" ? "All" : cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordions List */}
        <div className="mt-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-sm"
              >
                <Layers className="w-12 h-12 mx-auto text-muted-foreground/45 mb-4 animate-pulse" />
                <h3 className="font-semibold text-foreground text-lg mb-1">No FAQs Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  We couldn't find any questions matching your filters. Try checking spelling or using a different category.
                </p>
              </motion.div>
            ) : (
              filteredItems.map((item, idx) => {
                const isUrduQ = isUrduText(item.question);
                const isUrduA = isUrduText(item.answer);
                const isExpanded = expandedId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.4) }}
                    className={cn(
                      "bg-card bg-primary-light/30 border rounded-xl overflow-hidden transition-all shadow-sm duration-300",
                      isExpanded
                        ? "border-primary/40 ring-1 ring-primary/10 shadow-md bg-primary-light/50"
                        : "border-border/60 hover:border-primary/30"
                    )}
                  >
                    {/* Trigger / Question */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={cn(
                        "w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-semibold text-foreground text-base md:text-lg transition-colors hover:text-primary",
                        isExpanded && "bg-primary text-primary-foreground hover:text-primary-foreground",
                        isUrduQ && "text-right font-nastaleeq"
                      )}
                      dir={isUrduQ ? "rtl" : "ltr"}
                      style={isUrduQ ? { fontFamily: "'Jameel Noori Nastaleeq', serif" } : undefined}
                    >
                      <span className="flex-1 pr-2 leading-relaxed">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          "w-7 h-7 text-primary bg-green-100 rounded-full p-1 shrink-0 transition-transform duration-300",
                          isExpanded && "rotate-180 text-primary"
                        )}
                      />
                    </button>

                    {/* Content / Answer */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div
                            className="p-6 text-[#222222] max-w-none text-sm md:text-base leading-relaxed faq-answer faq-answer-inner"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
