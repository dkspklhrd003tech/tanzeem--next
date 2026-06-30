"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition, useCallback } from "react";
import {
  MapPin, Clock, Users, UserRound, Phone,
  LibraryBig, RotateCcw, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
type DarseEvent = {
  id: string;
  city: string;
  time: string;
  address: string;
  type: string;
  hasLadiesArrangement: boolean;
  mudarris: string;
  contact: string | null;
};

interface QuranicCirclesPageProps {
  /** Filtered subset shown in the grid */
  events: DarseEvent[];
  /** All events — used only for total count badge */
  allEvents: DarseEvent[];
  cities: string[];
  types: string[];
  activeCity: string;
  activeType: string;
  activeLadies: string;
  total: number;
  filteredTotal: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildUrl(
  overrides: Record<string, string>,
  current: { city: string; type: string; ladies: string }
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  if (merged.city) params.set("city", merged.city);
  if (merged.type) params.set("type", merged.type);
  if (merged.ladies) params.set("ladies", merged.ladies);
  const qs = params.toString();
  return `/quranic-circles${qs ? `?${qs}` : ""}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function QuranicCirclesPage({
  events,
  allEvents,
  cities,
  types,
  activeCity,
  activeType,
  activeLadies,
  total,
  filteredTotal,
}: QuranicCirclesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = { city: activeCity, type: activeType, ladies: activeLadies };

  const navigate = useCallback(
    (overrides: Record<string, string>) => {
      startTransition(() => router.push(buildUrl(overrides, current)));
    },
    [router, current]
  );

  const reset = () =>
    startTransition(() => router.push("/quranic-circles"));

  const hasActiveFilters = !!(activeCity || activeType || activeLadies);

  return (
    <div className="container max-w-7xl mx-auto py-10">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <p className="text-foreground-muted max-w-2xl">
          {total} active circle{total !== 1 ? "s" : ""} across Pakistan.
          Find a Quran study session near you.
        </p>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              City (شہر)
            </label>
            <select
              value={activeCity}
              onChange={(e) => navigate({ city: e.target.value, type: activeType, ladies: activeLadies })}
              className="w-full py-2.5 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Program Type
            </label>
            <select
              value={activeType}
              onChange={(e) => navigate({ city: activeCity, type: e.target.value, ladies: activeLadies })}
              className="w-full py-2.5 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Any Type</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Ladies arrangement */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Arrangement
            </label>
            <select
              value={activeLadies}
              onChange={(e) => navigate({ city: activeCity, type: activeType, ladies: e.target.value })}
              className="w-full py-2.5 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Any</option>
              <option value="yes">Ladies Arrangement Available</option>
            </select>
          </div>

          {/* Results + reset */}
          <div className="flex items-center justify-between gap-3 pt-4 sm:pt-0">
            <p className="text-sm text-foreground-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold text-foreground">{filteredTotal}</span> shown
              </span>
            </p>
            {hasActiveFilters && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                aria-label="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── City pill tabs (quick select) ── */}
      {cities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter by city">
          <button
            role="tab"
            aria-selected={!activeCity}
            onClick={() => navigate({ city: "" })}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium border transition-colors",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              !activeCity
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground-muted hover:border-primary hover:text-primary"
            )}
          >
            All Cities
          </button>
          {cities.map((city) => (
            <button
              key={city}
              role="tab"
              aria-selected={activeCity === city}
              onClick={() => navigate({ city })}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium border transition-colors",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                activeCity === city
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground-muted hover:border-primary hover:text-primary"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <LibraryBig className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-foreground-muted font-medium">
            {hasActiveFilters
              ? "No circles match your filters. Try resetting."
              : "No Dars-e-Quran circles available at the moment."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200",
            isPending && "opacity-50 pointer-events-none"
          )}
        >
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-mid transition-shadow flex flex-col group"
            >
              {/* Card header */}
              <div className="bg-primary px-5 py-4 flex justify-between items-center gap-4 group-hover:bg-primary-dark transition-colors">
                <h3 className="text-primary-foreground font-bold text-lg truncate">
                  {event.city}
                </h3>
                <span className="bg-primary-foreground text-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm shrink-0">
                  {event.time}
                </span>
              </div>

              {/* Card body */}
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-foreground text-sm leading-relaxed">{event.address}</p>
                </div>

                <div className="flex items-center gap-3">
                  <LibraryBig className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <p className="text-foreground text-sm">{event.type}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <p className="text-foreground text-sm">
                    Ladies Arrangement:{" "}
                    <span className="font-semibold">
                      {event.hasLadiesArrangement ? "Yes" : "No"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <UserRound className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <p className="text-foreground text-sm">
                    Mudarris: <span className="font-semibold">{event.mudarris}</span>
                  </p>
                </div>

                <div className="flex-1" />

                {event.contact && (
                  <div className="pt-4 border-t border-border mt-auto">
                    <a
                      href={`tel:${event.contact.replace(/[^+\d]/g, "")}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-sm font-semibold transition-colors border border-primary/20 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      {event.contact}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── CTA strip ── */}
      <div className="mt-12 bg-primary rounded-xl p-6 md:p-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white mb-2">
            Want to Start a Dars-e-Quran in Your Area?
          </h2>
          <p className="text-white/70 text-sm mb-5 max-w-lg mx-auto">
            Contact your local Tanzeem-e-Islami representative or reach out to the Markaz
            and we will help you set up a Quranic study circle.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold rounded-full px-6 py-2.5 text-sm hover:bg-white/90 transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
