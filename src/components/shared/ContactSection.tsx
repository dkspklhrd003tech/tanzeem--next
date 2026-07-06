"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AddressDetail = {
  id: string;
  title: string;
  titleValue?: string;
  titleValueUrl?: string;
  naibAmeer?: string;
  naibAmeerUrl?: string;
  address: string;
  addressUrl?: string;
  phone: string;
  phoneUrl?: string;
  mobile?: string;
  mobileUrl?: string;
  email: string;
  emailUrl?: string;
  mapUrl: string;
};

/** Shape of a row from the `locations` table. */
export type LocationRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  details: AddressDetail[] | null;
  isActive: boolean;
};

export interface ContactSectionProps {
  /** Flattened key→value map from the `settings` table, group = "contact". */
  contactSettings?: Record<string, string>;
  /** Rows from the `locations` table (isActive = true). */
  locationRows?: LocationRow[];
}

// ── Static fallback defaults (used when DB has no data yet) ───────────────────

const DEFAULT_SETTINGS: Record<string, string> = {
  footer_address: "23 KM Multan Road, Near Chung, Lahore, Punjab, Pakistan",
  contact_phone: "+92 (42) 35473375-78",
  contact_email: "markaz@tanzeem.org",
  contact_email_office: "info@tanzeem.org",
};

/** Markaz fallback shown while locations table is empty / being seeded. */
const MARKAZ_FALLBACK: LocationRow = {
  id: "markaz-fallback",
  name: "Markaz / مرکز",
  slug: "markaz",
  city: "Lahore",
  country: "Pakistan",
  address:
    "Dar ul Islam, Markaz Tanzeem-e-Islami, Multan Road, Chung Lahore 53800",
  phone: "(042) 35473375-78",
  email: "markaz@tanzeem.org",
  details: null,
  isActive: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ContactSection({
  contactSettings = {},
  locationRows = [],
}: ContactSectionProps) {
  // Merge DB settings over fallback defaults
  const s = { ...DEFAULT_SETTINGS, ...contactSettings };

  // Use DB locations or fall back to just Markaz so the UI is never empty
  const branches: LocationRow[] =
    locationRows.length > 0 ? locationRows : [MARKAZ_FALLBACK];

  const [activeSlug, setActiveSlug] = useState<string>(branches[0].slug);
  const activeBranch = branches.find((b) => b.slug === activeSlug) ?? branches[0];

  // ── Top 3 info cards (driven by settings) ──────────────────────────────────
  const infoCards = [
    {
      icon: MapPin,
      title: "Address",
      lines: [s.footer_address],
    },
    {
      icon: Phone,
      title: "Phone",
      lines: [
        s.contact_phone
          ? `Landline: ${s.contact_phone}`
          : s.whatsapp_number
            ? `WhatsApp: ${s.whatsapp_number}`
            : "Contact us via email",
      ],
    },
    {
      icon: Mail,
      title: "Email Address",
      lines: [
        s.contact_email ? `General: ${s.contact_email}` : "",
        s.contact_email_office ? `Office: ${s.contact_email_office}` : "",
      ].filter(Boolean),
    },
  ];

  return (
    <section className="bg-background relative overflow-hidden pb-20">
      {/* Cinematic Header Background */}
      <div className="absolute inset-0 top-0 h-[500px] w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />
      <div className="absolute left-1/2 -top-[150px] -translate-x-1/2 -z-10 h-[400px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 pt-16">

        {/* ── 3 info cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 relative z-10">
          {infoCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary transition-all duration-500 shadow-sm">
                <card.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" aria-hidden="true" />
              </div>

              <div className="relative z-10">
                <h3 className="font-bold text-foreground text-xl mb-3 tracking-tight">
                  {card.title}
                </h3>
                <div className="space-y-1.5 flex flex-col items-center">
                  {card.lines.map((line, j) => {
                    let href: string | undefined = undefined;
                    let displayLine = line;

                    if (!line) return null;

                    if (card.title === "Phone" && line.includes(":")) {
                      const number = line.split(":")[1]?.trim() || "";
                      href = `tel:${number.replace(/[^+\d]/g, "")}`;
                    } else if (card.title === "Email Address" && line.includes(":")) {
                      const email = line.split(":")[1]?.trim() || "";
                      href = `mailto:${email}`;
                    } else if (card.title === "Address") {
                      href = `https://maps.google.com/?q=${encodeURIComponent(line)}`;
                    }

                    return href ? (
                      <a
                        key={j}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground leading-relaxed font-medium hover:text-primary transition-colors block text-center"
                      >
                        {displayLine}
                      </a>
                    ) : (
                      <p key={j} className="text-sm text-muted-foreground leading-relaxed font-medium text-center">
                        {displayLine}
                      </p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Contact form & Locations Grid ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-black/5"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Send a Message</h2>
              <p className="text-sm text-muted-foreground font-medium">We'll get back to you as soon as possible.</p>
            </div>
            <ContactForm />
          </motion.div>

          {/* Branches Side */}
          {branches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 flex flex-col h-full"
            >
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-black/5 h-full flex flex-col">
                <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Our Locations</h2>
                    <p className="text-sm text-muted-foreground font-medium">Find a branch near you.</p>
                  </div>
                </div>

                {/* Tab buttons - Cinematic Pills */}
                <div
                  className="flex flex-wrap gap-2 mb-8 bg-muted/50 p-1.5 rounded-2xl"
                  role="tablist"
                  aria-label="Branch locations"
                >
                  {branches.map((branch) => (
                    <button
                      key={branch.slug}
                      role="tab"
                      aria-selected={activeSlug === branch.slug}
                      onClick={() => setActiveSlug(branch.slug)}
                      className={cn(
                        "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                        activeSlug === branch.slug
                          ? "bg-background text-foreground shadow-sm shadow-black/5 ring-1 ring-border/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      {branch.name}
                    </button>
                  ))}
                </div>

                {/* Active branch details panel */}
                <div
                  role="tabpanel"
                  className="flex-1 bg-muted/20 rounded-2xl p-6 md:p-8 border border-border/40 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <MapPin className="w-40 h-40" />
                  </div>

                  <h3 className="text-2xl font-bold mb-6 text-foreground">{activeBranch.name}</h3>

                  {/* Legacy fields if no details array exists */}
                  {(!activeBranch.details || activeBranch.details.length === 0) && (
                    <dl className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-5 gap-x-4 text-sm relative z-10">
                      {activeBranch.city && (
                        <>
                          <dt className="font-semibold text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" /> City
                          </dt>
                          <dd className="text-foreground font-medium">{activeBranch.city}</dd>
                        </>
                      )}
                      {activeBranch.address && (
                        <>
                          <dt className="font-semibold text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary opacity-0" /> Address
                          </dt>
                          <dd className="text-foreground font-medium leading-relaxed max-w-md">
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(activeBranch.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-start gap-1">
                              {activeBranch.address}
                            </a>
                          </dd>
                        </>
                      )}
                      {activeBranch.phone && (
                        <>
                          <dt className="font-semibold text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" /> Phone
                          </dt>
                          <dd>
                            <a
                              href={`tel:${activeBranch.phone.replace(/[^+\d]/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-foreground font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
                            >
                              {activeBranch.phone}
                            </a>
                          </dd>
                        </>
                      )}
                      {activeBranch.email && (
                        <>
                          <dt className="font-semibold text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" /> Email
                          </dt>
                          <dd>
                            <a
                              href={`mailto:${activeBranch.email}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-foreground font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
                            >
                              {activeBranch.email}
                            </a>
                          </dd>
                        </>
                      )}
                    </dl>
                  )}

                  {/* Multiple Addresses Grid */}
                  {activeBranch.details && activeBranch.details.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 relative z-10">
                      {activeBranch.details.map(detail => (
                        <div key={detail.id} className="bg-[#cccccc] rounded-sm p-5 text-[#333333] text-sm md:text-base space-y-2 shadow-inner border border-black/5">
                          {detail.title && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">{detail.title}</div>
                              <div className="flex-1">
                                {detail.titleValueUrl ? (
                                  <a href={detail.titleValueUrl} target="_blank" rel="noopener noreferrer" className="text-[#0000ee] hover:underline break-all font-medium">
                                    {detail.titleValue || ""}
                                  </a>
                                ) : (
                                  detail.titleValue || ""
                                )}
                              </div>
                            </div>
                          )}
                          {detail.naibAmeer && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">Naib Ameer</div>
                              <div className="flex-1">
                                {detail.naibAmeerUrl ? (
                                  <a href={detail.naibAmeerUrl} target="_blank" rel="noopener noreferrer" className="text-[#0000ee] hover:underline break-all font-medium">
                                    {detail.naibAmeer}
                                  </a>
                                ) : (
                                  detail.naibAmeer
                                )}
                              </div>
                            </div>
                          )}
                          {detail.address && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">Postal Address:</div>
                              <div className="flex-1">
                                {detail.addressUrl ? (
                                  <a href={detail.addressUrl} target="_blank" rel="noopener noreferrer" className="text-[#0000ee] hover:underline break-all font-medium">
                                    {detail.address}
                                  </a>
                                ) : (
                                  detail.address
                                )}
                              </div>
                            </div>
                          )}
                          {detail.phone && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">Phone:</div>
                              <div className="flex-1">
                                {detail.phoneUrl ? (
                                  <a href={detail.phoneUrl} target="_blank" rel="noopener noreferrer" className="text-[#0000ee] hover:underline break-all font-medium">
                                    {detail.phone}
                                  </a>
                                ) : (
                                  detail.phone
                                )}
                              </div>
                            </div>
                          )}
                          {detail.mobile && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">Mob:</div>
                              <div className="flex-1">
                                {detail.mobileUrl ? (
                                  <a href={detail.mobileUrl} target="_blank" rel="noopener noreferrer" className="text-[#0000ee] hover:underline break-all font-medium">
                                    {detail.mobile}
                                  </a>
                                ) : (
                                  detail.mobile
                                )}
                              </div>
                            </div>
                          )}
                          {detail.email && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">Email:</div>
                              <div className="flex-1">
                                <a href={detail.emailUrl || `mailto:${detail.email}`} className="text-[#0000ee] hover:underline break-all font-medium">{detail.email}</a>
                              </div>
                            </div>
                          )}
                          {detail.mapUrl && (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <div className="font-bold sm:w-[160px] shrink-0 text-black">Pin Location:</div>
                              <div className="flex-1 truncate">
                                <a href={detail.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[#0000ee] hover:underline break-all font-medium">
                                  {detail.mapUrl}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!activeBranch.phone && !activeBranch.city && (
                    <p className="text-sm text-muted-foreground mt-8 bg-background p-4 rounded-xl border border-border/50 flex items-start gap-3">
                      <span className="flex-1">
                        Full contact details for this branch will be available soon.
                        Please email <a href="mailto:markaz@tanzeem.org" className="text-primary hover:underline font-medium">markaz@tanzeem.org</a> for assistance.
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
