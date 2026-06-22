"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

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
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-5xl">

        {/* ── 3 info cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {infoCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center gap-3 shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                <card.icon
                  className="h-6 w-6 text-primary-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-bold text-foreground text-base">
                {card.title}
              </h3>
              {card.lines.map((line, j) => (
                <p key={j} className="text-sm text-foreground-muted leading-relaxed">
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>

        {/* ── Contact form ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-xl p-6 md:p-8 mb-12 shadow-sm"
        >
          <ContactForm />
        </motion.div>

        {/* ── Branch / city tabs ─────────────────────────────────────────── */}
        {branches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Tab buttons */}
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Branch locations"
            >
              {branches.map((branch) => (
                <button
                  key={branch.slug}
                  role="tab"
                  aria-selected={activeSlug === branch.slug}
                  aria-controls={`branch-panel-${branch.slug}`}
                  onClick={() => setActiveSlug(branch.slug)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    activeSlug === branch.slug
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground-muted border-border hover:text-primary hover:border-primary/40"
                  )}
                >
                  {branch.name}
                </button>
              ))}
            </div>

            {/* Active branch details panel */}
            <div
              id={`branch-panel-${activeBranch.slug}`}
              role="tabpanel"
              aria-label={`${activeBranch.name} branch details`}
              className="bg-card border border-border rounded-b-xl rounded-tr-xl p-6 shadow-sm"
            >
              <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 gap-x-4 text-sm">
                {activeBranch.city && (
                  <>
                    <dt className="font-semibold text-foreground">City</dt>
                    <dd className="text-foreground-muted">{activeBranch.city}</dd>
                  </>
                )}
                {activeBranch.address && (
                  <>
                    <dt className="font-semibold text-foreground">Address</dt>
                    <dd className="text-foreground-muted">{activeBranch.address}</dd>
                  </>
                )}
                {activeBranch.phone && (
                  <>
                    <dt className="font-semibold text-foreground">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${activeBranch.phone.replace(/[^+\d]/g, "")}`}
                        className="text-primary hover:underline"
                      >
                        {activeBranch.phone}
                      </a>
                    </dd>
                  </>
                )}
                {activeBranch.email && (
                  <>
                    <dt className="font-semibold text-foreground">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${activeBranch.email}`}
                        className="text-primary hover:underline"
                      >
                        {activeBranch.email}
                      </a>
                    </dd>
                  </>
                )}
                {activeBranch.country && (
                  <>
                    <dt className="font-semibold text-foreground">Country</dt>
                    <dd className="text-foreground-muted">{activeBranch.country}</dd>
                  </>
                )}
              </dl>

              {/* Only address/email populated hint */}
              {!activeBranch.phone && !activeBranch.city && (
                <p className="text-xs text-foreground-muted italic mt-3">
                  Full contact details for this branch will be available soon.
                  Please email{" "}
                  <a href="mailto:markaz@tanzeem.org" className="text-primary hover:underline">
                    markaz@tanzeem.org
                  </a>{" "}
                  for assistance.
                </p>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
