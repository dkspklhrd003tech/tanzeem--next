"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin, Users, Phone, Navigation, Info, Search, RotateCcw,
  ChevronRight, Calendar, Loader2, Compass, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface QuranicCirclesPageProps {
  csvUrl: string;
  title: string;
  descriptionHtml: string;
}

interface CircleData {
  city: string;
  address: string;
  time: string;
  day: string;
  contact: string;
  location: string;
  halqa: string;
  weeks: string;
  lat: number | null;
  lon: number | null;
}

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getField(row: Record<string, string>, aliases: string[]): string {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    const normalizedKey = normalize(key);
    for (const alias of aliases) {
      if (normalizedKey.includes(normalize(alias))) {
        return String(value || "").trim();
      }
    }
  }
  return "";
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const parseLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^"|"$/g, '').trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  return data;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function QuranicCirclesPage({
  csvUrl,
  title,
  descriptionHtml,
}: QuranicCirclesPageProps) {
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCity, setActiveCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [findingNearest, setFindingNearest] = useState(false);
  const perPage = 12;

  // Clean descriptionHtml by removing the raw CSV url link
  const cleanDescriptionHtml = useMemo(() => {
    return descriptionHtml
      .replace(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[^\s"']+/g, "")
      .trim();
  }, [descriptionHtml]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(csvUrl);
        if (!res.ok) throw new Error("Failed to fetch Google Sheet data.");
        const text = await res.text();
        const parsed = parseCSV(text);

        const mapped: CircleData[] = parsed
          .map((row) => {
            const city = getField(row, ["city / area", "city", "area", "شہر", "علاقہ"]);
            const address = getField(row, ["complete venue address", "venue address", "address", "مکمل پتا"]);
            const time = getField(row, ["time", "وقت"]);
            const day = getField(row, ["day", "دن"]);
            const contact = getField(row, ["contact mobile number", "mobile number", "contact", "فون"]);
            const location = getField(row, ["google maps location", "maps location", "location", "گوگل میپس"]);
            const halqa = getField(row, ["halqa", "region/zone", "حلقہ"]);
            const weeks = getField(row, ["weeks during", "every week", "week", "ہفتے"]);
            const latVal = parseFloat(getField(row, ["latitude", "lat"]));
            const lonVal = parseFloat(getField(row, ["longitude", "lng", "lon", "long"]));

            return {
              city,
              address,
              time,
              day,
              contact,
              location,
              halqa,
              weeks,
              lat: Number.isFinite(latVal) ? latVal : null,
              lon: Number.isFinite(lonVal) ? lonVal : null,
            };
          })
          .filter((c) => c.city && c.address);

        setCircles(mapped);
      } catch (err: any) {
        console.error("CSV loading error:", err);
        setError("Unable to load live Quranic circles data. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [csvUrl]);

  const cities = useMemo(() => {
    const list = Array.from(new Set(circles.map((c) => c.city))).filter(Boolean);
    return list.sort((a, b) => a.localeCompare(b));
  }, [circles]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const city = activeCity.toLowerCase();

    return circles
      .filter((c) => {
        const haystack = [
          c.city,
          c.address,
          c.halqa,
          c.day,
          c.time,
          c.weeks,
        ].join(" ").toLowerCase();

        const matchesCity = !activeCity || c.city.toLowerCase() === city;
        const matchesSearch = !query || haystack.includes(query);

        return matchesCity && matchesSearch;
      })
      .sort((a, b) => {
        if (!activeCity) {
          const cityComp = a.city.localeCompare(b.city);
          if (cityComp !== 0) return cityComp;
        }
        return a.address.localeCompare(b.address);
      });
  }, [circles, activeCity, searchQuery]);

  const hasCoords = useMemo(() => {
    return circles.some((c) => c.lat !== null && c.lon !== null);
  }, [circles]);

  const findNearestCity = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setFindingNearest(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFindingNearest(false);
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        const cityPoints: Record<string, [number, number][]> = {};
        circles.forEach((c) => {
          if (c.lat !== null && c.lon !== null) {
            (cityPoints[c.city] ||= []).push([c.lat, c.lon]);
          }
        });

        const cities = Object.keys(cityPoints);
        if (!cities.length) {
          alert("No coordinates found in sheet data to compute nearest city.");
          return;
        }

        const cityDistances = cities.map((city) => {
          let best = Infinity;
          for (const [lat, lon] of cityPoints[city]) {
            const d = haversine(userLat, userLon, lat, lon);
            if (d < best) best = d;
          }
          return { city, dist: best };
        });

        cityDistances.sort((a, b) => a.dist - b.dist);

        if (cityDistances.length > 0) {
          setActiveCity(cityDistances[0].city);
          setSearchQuery("");
          setCurrentPage(1);
        }
      },
      (err) => {
        setFindingNearest(false);
        console.error("Geolocation error:", err);
        alert("Unable to fetch location. Please try again.");
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginatedCircles = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const resetFilters = () => {
    setActiveCity("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Public Programs", path: "/public-programs" },
    { name: "Quranic Circles", path: "/quranic-circles" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d5844] via-[#005031] to-[#003d25] text-white pt-24 pb-20 md:pt-28 md:pb-28">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8a84e]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-repeat bg-center"
          style={{ backgroundImage: `url('/images/pattern-arabesque.png')`, backgroundSize: '180px' }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-emerald-100/80 mb-6 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-60 text-[#c8a84e]" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-emerald-200">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="hover:text-white transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* Dynamic Intro Description HTML */}
        {cleanDescriptionHtml && (
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-md mb-8">
            <article 
              className="prose prose-emerald dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-zinc-300"
              dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
            />
          </div>
        )}

        {/* Filter Controls Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by city, address, halqa, day, time..."
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>

            {/* City Dropdown */}
            <div className="w-full md:w-64">
              <select
                value={activeCity}
                onChange={(e) => { setActiveCity(e.target.value); setCurrentPage(1); }}
                className="w-full py-2.5 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Find Nearest Button */}
            {hasCoords && (
              <button
                onClick={findNearestCity}
                disabled={findingNearest}
                className="flex items-center justify-center gap-2 py-2.5 px-5 bg-primary text-white hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 rounded-xl text-sm font-semibold transition-all shadow-sm shrink-0"
              >
                {findingNearest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
                {findingNearest ? "Locating..." : "Find Nearest"}
              </button>
            )}

            {/* Reset Filters button */}
            {(activeCity || searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Dynamic State Layout (Loading / Error / Empty / Grid) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse text-sm">Loading Quranic study circles...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-destructive/30 rounded-2xl bg-destructive/5 text-center max-w-xl mx-auto">
            <AlertCircle className="w-10 h-10 text-destructive mb-3" />
            <h3 className="font-bold text-foreground mb-1">Error Loading Data</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <Info className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-foreground-muted font-medium">
              No Quranic circles match your filters.
            </p>
            {(activeCity || searchQuery) && (
              <button
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Total Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Showing {filtered.length} circle{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCircles.map((circle, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                  className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-primary/5 dark:bg-primary/10 px-5 py-4 border-b border-border flex justify-between items-center gap-4">
                    <h3 className="text-primary dark:text-[#c8a84e] font-bold text-lg truncate">
                      {circle.city}
                    </h3>
                    {circle.time && (
                      <span className="bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                        {circle.time}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col space-y-3.5">
                    {circle.halqa && (
                      <div className="flex items-start gap-2.5 text-foreground/90">
                        <Users className="w-4 h-4 text-primary dark:text-[#c8a84e] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                          {circle.halqa}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-primary dark:text-[#c8a84e] shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {circle.address}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-primary dark:text-[#c8a84e] shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-zinc-300">
                        {circle.day || "N/A"}
                      </span>
                    </div>

                    {circle.weeks && (
                      <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <Info className="w-3.5 h-3.5 text-primary dark:text-[#c8a84e] shrink-0 mt-0.5" />
                        <span>{circle.weeks}</span>
                      </div>
                    )}

                    <div className="flex-1" />

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-border mt-4">
                      {circle.contact ? (
                        <a
                          href={`tel:${circle.contact.replace(/[^+\d]/g, "")}`}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                          No phone
                        </div>
                      )}

                      {circle.location ? (
                        <a
                          href={circle.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Directions
                        </a>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-2 bg-slate-50 dark:bg-zinc-900 rounded-lg">
                          No map link
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(p - 1, 1)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm transition-all"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => { setCurrentPage((p) => Math.min(p + 1, totalPages)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
