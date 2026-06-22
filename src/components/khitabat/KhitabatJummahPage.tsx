"use client";

import { useState, useMemo } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Map,
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type KhitabatAddress = {
  id: string;
  masjid: string;
  address: string;
  city: string;
  time: string;
  contact: string | null;
  map: string | null;
};

interface KhitabatJummahPageProps {
  addresses: KhitabatAddress[];
}

export function KhitabatJummahPage({ addresses }: KhitabatJummahPageProps) {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 1. Get unique sorted cities for the filter
  const cities = useMemo(() => {
    return Array.from(new Set(addresses.map((a) => a.city).filter(Boolean))).sort();
  }, [addresses]);

  // 2. Filter & Sort addresses
  const filteredAddresses = useMemo(() => {
    let result = addresses.filter((item) => {
      const matchCity = !selectedCity || item.city.toLowerCase() === selectedCity.toLowerCase();
      const matchSearch =
        !search ||
        item.masjid.toLowerCase().includes(search.toLowerCase()) ||
        item.address.toLowerCase().includes(search.toLowerCase());
      return matchCity && matchSearch;
    });

    // Sort by city first if no city is selected, then by masjid name
    return result.sort((a, b) => {
      if (!selectedCity) {
        const cityComp = a.city.localeCompare(b.city);
        if (cityComp !== 0) return cityComp;
      }
      return a.masjid.localeCompare(b.masjid);
    });
  }, [addresses, selectedCity, search]);

  // 3. Paginated subset
  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage) || 1;
  const paginatedAddresses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAddresses.slice(start, start + itemsPerPage);
  }, [filteredAddresses, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10">
      {/* ── Page Header ── */}
      <div className="mb-10 text-center md:text-left">
        <p className="section-label mb-1">Public Programs</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Khitabat-e-Jummah Addresses (خطاباتِ جمعہ)
        </h1>
        <p className="text-foreground-muted max-w-2xl">
          Weekly Friday sermon addresses of Tanzeem-e-Islami across Pakistan.
          Find a venue and timings near you.
        </p>
      </div>

      {/* ── Controls Panel ── */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* City Select */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              City (شہر)
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground font-medium"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Search Masjid or Address
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by masjid or address..."
                className="w-full py-2.5 pl-10 pr-4 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-foreground-muted"
              />
            </div>
          </div>

          {/* Action Area */}
          <div className="md:col-span-2 flex flex-col justify-end h-full pt-4 md:pt-0">
            <div className="flex items-center justify-between md:justify-end gap-3 w-full">
              <span className="text-sm font-semibold text-foreground-muted md:hidden">
                {filteredAddresses.length} Found
              </span>
              {(selectedCity || search) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors px-3 py-2 bg-primary/5 rounded-lg border border-primary/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Summary Badge ── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-foreground-muted">
          Showing{" "}
          <span className="font-bold text-foreground">
            {filteredAddresses.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-foreground">
            {Math.min(currentPage * itemsPerPage, filteredAddresses.length)}
          </span>{" "}
          of <span className="font-bold text-foreground">{filteredAddresses.length}</span> venues
        </p>
      </div>

      {/* ── Card Grid ── */}
      {filteredAddresses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-card/50">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-foreground-muted font-medium">
            No venues match your search filters.
          </p>
          {(selectedCity || search) && (
            <button
              onClick={resetFilters}
              className="mt-4 text-sm font-bold text-primary hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {paginatedAddresses.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Header */}
                <div className="bg-primary px-5 py-4 flex justify-between items-center gap-4 group-hover:bg-primary/95 transition-colors">
                  <h3 className="text-primary-foreground font-bold text-md leading-snug line-clamp-1 flex-1">
                    {item.masjid || "Masjid"}
                  </h3>
                  <span className="bg-primary-foreground/10 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md shrink-0 border border-primary-foreground/20">
                    {item.city}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-foreground text-sm leading-relaxed">{item.address}</p>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-3">
                    <Clock className="w-4.5 h-4.5 text-primary shrink-0" />
                    <p className="text-foreground text-sm font-medium">{item.time}</p>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/60 flex flex-col gap-2 mt-auto">
                    {item.contact && (
                      <a
                        href={`tel:${item.contact.replace(/[^\d+]/g, "")}`}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-xs font-bold transition-colors border border-primary/10"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call {item.contact}
                      </a>
                    )}
                    {item.map && (
                      <a
                        href={item.map}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-background hover:bg-muted text-foreground-muted hover:text-foreground rounded-lg text-xs font-semibold transition-colors border border-border"
                      >
                        <Map className="w-3.5 h-3.5 text-primary" />
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-9 h-9 bg-card border border-border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors text-foreground"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pageNum === currentPage;
              
              // Only show first, last, and pages around current page to prevent overflow
              if (
                totalPages > 6 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="text-foreground-muted px-1 text-sm">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-sm font-semibold transition-colors border",
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted text-foreground"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-9 h-9 bg-card border border-border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors text-foreground"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
