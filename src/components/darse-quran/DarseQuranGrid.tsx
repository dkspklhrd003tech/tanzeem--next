"use client";

import { MapPin, LibraryBig, Users, UserRound, Phone } from "lucide-react";
import React, { useEffect, useState } from "react";

interface DarseQuranEvent {
    id: string;
    city: string;
    time: string;
    address: string;
    type: string;
    hasLadiesArrangement: boolean;
    mudarris: string;
    contact: string;
}

export function DarseQuranGrid() {
    const [events, setEvents] = useState<DarseQuranEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch only published events (admin=false by default in API)
                const res = await fetch("/api/darse-quran");
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.events || []);
                }
            } catch (error) {
                console.error("Failed to load events", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-16">
                <div className="animate-pulse flex items-center gap-2 text-[#0d5844] font-bold">
                    <LibraryBig className="w-5 h-5 animate-bounce" />
                    Loading Schedules...
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="w-full flex justify-center py-16">
                <p className="text-muted-foreground font-medium">No events are currently scheduled.</p>
            </div>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto pb-16 font-lato">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {events.map((event) => (
                    <div key={event.id} className="bg-[#fefefc] rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">

                        {/* Card Header Teal */}
                        <div className="bg-[#0d5844] px-5 py-4 flex justify-between items-center group-hover:bg-[#0a4535] transition-colors gap-4">
                            <h3 className="text-[#fefefc] font-bold text-lg truncate">{event.city}</h3>
                            <div className="bg-[#fefefc] text-[#0d5844] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm shrink-0">
                                {event.time}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col space-y-4">

                            {/* Address Row */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#0d5844] shrink-0 mt-0.5" />
                                <p className="text-foreground text-sm font-medium leading-relaxed">
                                    {event.address}
                                </p>
                            </div>

                            {/* Type Row */}
                            <div className="flex items-center gap-3">
                                <LibraryBig className="w-5 h-5 text-[#0d5844] shrink-0" />
                                <p className="text-foreground text-sm">
                                    {event.type}
                                </p>
                            </div>

                            {/* Ladies Arrangement Row */}
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-[#0d5844] shrink-0" />
                                <p className="text-foreground text-sm">
                                    Ladies Arrangement: <span className="font-bold">{event.hasLadiesArrangement ? "Yes" : "No"}</span>
                                </p>
                            </div>

                            {/* Instructor / Mudarris Row */}
                            <div className="flex items-center gap-3">
                                <UserRound className="w-5 h-5 text-[#0d5844] shrink-0" />
                                <p className="text-foreground text-sm">
                                    Mudarris: <span className="font-bold">{event.mudarris}</span>
                                </p>
                            </div>

                            {/* Spacer to push contact to bottom */}
                            <div className="flex-1"></div>

                            {/* Contact Row / Interaction */}
                            {event.contact && (
                                <div className="pt-4 border-t border-border mt-auto">
                                    <a
                                        href={`tel:${event.contact}`}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/5 hover:bg-primary/10 text-[#0d5844] rounded-lg text-sm font-bold transition-colors border border-primary/20"
                                    >
                                        <Phone className="w-4 h-4" />
                                        {event.contact}
                                    </a>
                                </div>
                            )}

                        </div>
                    </div>
                ))}

            </div>
        </section>
    );
}
