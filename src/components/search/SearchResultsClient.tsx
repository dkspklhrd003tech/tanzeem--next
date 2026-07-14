"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, FileText, Music, Video, Book, Newspaper, AlertCircle } from "lucide-react";

type ResultItem = {
  id: string;
  title: string;
  description: string;
  type: "page" | "post" | "audio" | "video" | "book" | "magazine" | "press_release" | "faq" | "social" | "speaker" | "audio_category" | "video_category";
  link: string;
  date?: Date | string | null;
};

type Props = {
  results: ResultItem[];
  searchTerm: string;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "page":
    case "post":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "audio":
    case "audio_category":
      return <Music className="h-4 w-4 text-green-500" />;
    case "video":
    case "video_category":
      return <Video className="h-4 w-4 text-red-500" />;
    case "book":
      return <Book className="h-4 w-4 text-amber-500" />;
    case "magazine":
    case "press_release":
      return <Newspaper className="h-4 w-4 text-purple-500" />;
    default:
      return <FileText className="h-4 w-4 text-foreground" />;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case "page":
      return "Page";
    case "post":
      return "Article";
    case "audio":
      return "Audio Lecture";
    case "video":
      return "Video Lecture";
    case "book":
      return "Book";
    case "magazine":
      return "Magazine";
    case "press_release":
      return "Press Release";
    case "faq":
      return "FAQ";
    case "social":
      return "Social Media";
    case "speaker":
      return "Speaker";
    case "audio_category":
      return "Audio Category";
    case "video_category":
      return "Video Category";
    default:
      return "Resource";
  }
};

export function SearchResultsClient({ results, searchTerm }: Props) {
  const [activeTab, setActiveTab] = useState<"All" | "Audios" | "Videos" | "Documents" | "FAQs" | "Social Media">("All");

  const filteredResults = results.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Audios") return ["audio", "speaker", "audio_category"].includes(item.type);
    if (activeTab === "Videos") return ["video", "speaker", "video_category"].includes(item.type);
    if (activeTab === "Documents") {
      return ["page", "post", "book", "magazine", "press_release"].includes(item.type);
    }
    if (activeTab === "FAQs") return item.type === "faq";
    if (activeTab === "Social Media") return item.type === "social";
    return true;
  });

  const tabs = ["All", "Audios", "Videos", "Documents", "FAQs", "Social Media"] as const;

  if (results.length === 0) {
    return (
      <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
        <AlertCircle className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No Results Found</h3>
        <p className="text-sm text-foreground-muted max-w-sm mx-auto">
          We couldn&rsquo;t find anything matching &ldquo;{searchTerm}&rdquo;. Please verify your spelling or try different keywords.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
        <h2 className="text-md font-semibold text-foreground whitespace-nowrap">
          <span className="text-xl text-primary">{results.length}</span> Result{results.length !== 1 ? "s" : ""} found for <span className="text-xl text-primary">&ldquo;{searchTerm}&rdquo;</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            // Count items for each tab
            const count = results.filter((item) => {
              if (tab === "All") return true;
              if (tab === "Audios") return ["audio", "speaker", "audio_category"].includes(item.type);
              if (tab === "Videos") return ["video", "speaker", "video_category"].includes(item.type);
              if (tab === "Documents") {
                return ["page", "post", "book", "magazine", "press_release"].includes(item.type);
              }
              if (tab === "FAQs") return item.type === "faq";
              if (tab === "Social Media") return item.type === "social";
              return true;
            }).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary"
                  }`}
              >
                {tab} <span className="text-xs ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResults.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="cursor-pointer bg-card border border-border/80 hover:bg-primary-light/50 hover:border-primary/30 rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-2 justify-between mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-[11px] font-semibold tracking-wide text-foreground">
                  {getTypeIcon(item.type)}
                  {getTypeName(item.type)}
                </span>
                {item.date && (
                  <span className="text-[11px] text-primary flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.date).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground hover:text-primary mb-2 line-clamp-2">
                <Link href={item.link}>{item.title}</Link>
              </h3>
              <div className="mt-4 flex justify-start">
                <Link
                  href={item.link}
                  className="text-sm font-semibold text-primary px-3 py-2 border border-[#0d5844] rounded-full flex items-center gap-1 group"
                >
                  Visit {getTypeName(item.type)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl">
          <AlertCircle className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
          <h3 className="text-md font-semibold text-foreground mb-1">No {activeTab} Found</h3>
          <p className="text-sm text-foreground-muted max-w-sm mx-auto">
            There are no results matching this category for &ldquo;{searchTerm}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
