"use client";

import { Search, RotateCcw } from "lucide-react";
import React from "react";

export function DarseQuranFilters() {
    return (
        <section className="w-full max-w-7xl mx-auto mb-8">
            <div className="bg-[#fefefc] rounded-xl shadow-sm border border-border p-6 font-lato">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                    {/* Search Field */}
                    <div className="space-y-2 md:col-span-2 lg:col-span-1">
                        <label className="text-sm font-bold text-foreground">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by anything..."
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Filter: City */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">City (شہر)</label>
                        <select className="w-full py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                            <option value="">All Cities</option>
                            <option value="karachi">Karachi - کراچی</option>
                            <option value="lahore">Lahore - لاہور</option>
                            <option value="islamabad">Islamabad - اسلام آباد</option>
                            <option value="rawalpindi">Rawalpindi - راولپنڈی</option>
                            <option value="peshawar">Peshawar - پشاور</option>
                        </select>
                    </div>

                    {/* Filter: Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Dora / Summary</label>
                        <select className="w-full py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                            <option value="">Any Type</option>
                            <option value="dora">Dora-e-Tarjuma-e-Quran</option>
                            <option value="khulasa">Khulasa-e-Tarjuma-e-Quran</option>
                            <option value="namaz">Dora-e-Namaz</option>
                        </select>
                    </div>

                    {/* Filter: Ladies Arrangement */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Let's Find</label>
                        <select className="w-full py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                            <option value="">Any Arrangement</option>
                            <option value="men">Men Only - صرف مردوں کیلئے</option>
                            <option value="women">Ladies Arrangement Available - خواتین کا انتظام ہے</option>
                        </select>
                    </div>

                </div>

                {/* Bottom Actions */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Showing <span className="font-bold text-foreground">152</span> active locations
                    </p>
                    <button className="flex items-center gap-2 bg-[#0d5844] hover:bg-[#0a4535] text-[#fefefc] px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors w-full sm:w-auto justify-center">
                        <RotateCcw className="w-4 h-4" />
                        Reset Filters
                    </button>
                </div>
            </div>
        </section>
    );
}
