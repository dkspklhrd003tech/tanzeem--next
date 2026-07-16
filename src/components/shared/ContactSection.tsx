"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, ChevronDown, Building2, MapPinned, Send, Globe, User, MessagesSquare } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AddressDetail = {
  id: string;
  title: string;
  titleValue?: string;
  titleValueUrl?: string;
  titleValueUrlNewTab?: boolean;
  leaderTitle?: 'Ameer' | 'Naib Ameer';
  naibAmeer?: string;
  address: string;
  addressUrl?: string;
  addressUrlNewTab?: boolean;
  phone: string;
  phoneUrl?: string;
  phoneUrlNewTab?: boolean;
  mobile?: string;
  mobileUrl?: string;
  mobileUrlNewTab?: boolean;
  email: string;
  emailUrl?: string;
  emailUrlNewTab?: boolean;
  mapUrl: string;
  mapUrlNewTab?: boolean;
};

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
  contactSettings?: Record<string, string>;
  locationRows?: LocationRow[];
}

const DEFAULT_SETTINGS: Record<string, string> = {
  footer_address: "23 KM Multan Road, Near Chung, Lahore, Punjab, Pakistan",
  contact_phone: "+92 (42) 35473375-78",
  contact_email: "markaz@tanzeem.org",
  contact_email_office: "info@tanzeem.org",
};

export function ContactSection({
  contactSettings = {},
  locationRows = [],
}: ContactSectionProps) {
  const s = { ...DEFAULT_SETTINGS, ...contactSettings };

  let orderedBranches = [...locationRows];
  if (s.locations_order) {
    try {
      const order = JSON.parse(s.locations_order);
      orderedBranches.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    } catch (e) { }
  }
  const branches = orderedBranches;

  // For the vertical accordion in the right panel
  const [openBranchSlug, setOpenBranchSlug] = useState<string | null>(
    branches.length > 0 ? branches[0].slug : null
  );

  const toggleBranch = (slug: string) => {
    setOpenBranchSlug(prev => (prev === slug ? null : slug));
  };

  const getCleanNumber = (phone: string) => phone.replace(/[^+\d]/g, "");

  return (
    <section className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full bg-slate-50">

      {/* ── LEFT PANEL: Sticky & Immersive (Dark Emerald) ── */}
      <div className="relative lg:w-5/12 xl:w-1/3 bg-primary text-white flex flex-col p-4 md:p-6 lg:-10 overflow-hidden">

        {/* Cinematic Background Elements */}
        <div className="absolute inset-0 top-0 h-full w-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#137a5f] blur-[120px] -z-0 opacity-40 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" />

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Headquarters Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6">Headquarters</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <MapPin className="w-7 h-7 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Address</h3>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(s.footer_address)}`} target="_blank" rel="noopener noreferrer" className="text-white transition-colors leading-relaxed block text-[15px]">
                      {s.footer_address}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <Phone className="w-7 h-7 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Call Us</h3>
                    {s.contact_phone && (
                      <a href={`tel:${getCleanNumber(s.contact_phone)}`} className="text-white transition-colors block text-[15px] mb-1">
                        Landline: {s.contact_phone}
                      </a>
                    )}
                    {s.whatsapp_number && (
                      <a href={`tel:${getCleanNumber(s.whatsapp_number)}`} className="text-white transition-colors block text-[15px]">
                        WhatsApp: {s.whatsapp_number}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <Mail className="w-7 h-7 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    {s.contact_email && (
                      <a href={`mailto:${s.contact_email}`} className="text-white transition-colors block text-[15px] mb-1">
                        General: {s.contact_email}
                      </a>
                    )}
                    {s.contact_email_office && (
                      <a href={`mailto:${s.contact_email_office}`} className="text-white transition-colors block text-[15px]">
                        Office: {s.contact_email_office}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── RIGHT PANEL: Scrollable (Light Gray) ── */}
      <div className="lg:w-7/12 xl:w-2/3 flex flex-col">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 lg:py-10 space-y-12">

          {/* Section 1: Send a Message Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                <Send className="w-5 h-5 text-[#0d5844]" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.form_heading || "Send a Message"}</h2>
            </div>

            {/* The form container is intentionally clean and borderless to blend with the premium layout */}
            <div className="bg-primary-light rounded-[1rem] p-4 md:p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100">
              <ContactForm settings={s} />
            </div>
          </motion.div>

          {/* Section 2: Regional Branches (Vertical Accordion) */}
          {branches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#0d5844]" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Regional Branches</h2>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {branches.map((branch) => {
                  const isActive = openBranchSlug === branch.slug;
                  return (
                    <button
                      key={branch.slug}
                      onClick={() => setOpenBranchSlug(branch.slug)}
                      className={cn(
                        "px-6 py-3 rounded-full text-[15px] font-bold transition-all duration-300 border",
                        isActive
                          ? "bg-[#0d5844] text-white border-[#0d5844] shadow-md shadow-emerald-900/10"
                          : "bg-white text-slate-600 border-slate-200 hover:border-[#0d5844]/30 hover:text-[#0d5844]"
                      )}
                    >
                      {branch.name}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {branches.filter(b => b.slug === openBranchSlug).map((branch) => (
                  <motion.div
                    key={branch.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-[1rem] p-4 md:p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100"
                  >
                    {/* Legacy simple fields */}
                    {(!branch.details || branch.details.length === 0) && (
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-[16px]">
                        {branch.city && (
                          <div className="space-y-1">
                            <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> City</dt>
                            <dd className="font-semibold text-slate-900">{branch.city}</dd>
                          </div>
                        )}
                        {branch.address && (
                          <div className="space-y-1 md:col-span-2">
                            <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPinned className="w-3.5 h-3.5" /> Address</dt>
                            <dd className="font-medium text-foreground leading-relaxed max-w-xl">
                              <a href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#0d5844] transition-colors hover:underline decoration-slate-300 underline-offset-4">
                                {branch.address}
                              </a>
                            </dd>
                          </div>
                        )}
                        {branch.phone && (
                          <div className="space-y-1">
                            <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</dt>
                            <dd>
                              <a href={`tel:${getCleanNumber(branch.phone)}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-[#0d5844] transition-colors">
                                {branch.phone}
                              </a>
                            </dd>
                          </div>
                        )}
                        {branch.email && (
                          <div className="space-y-1">
                            <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</dt>
                            <dd>
                              <a href={`mailto:${branch.email}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-[#0d5844] transition-colors">
                                {branch.email}
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}

                    {/* Complex Detailed Addresses Array */}
                    {branch.details && branch.details.length > 0 && (
                      <div className="space-y-6">
                        {branch.details.map((detail, idx) => (
                          <div key={detail.id || idx} className="bg-primary-light rounded-xl p-6 border border-primary/40">
                            {detail.title && (
                              <div className="mb-6 pb-4 border-b border-slate-200/60 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                                  <MapPin className="w-7 h-7 text-[#0d5844]" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900">{detail.title}</h4>
                                  {detail.titleValue && (
                                    <span className="text-sm text-slate-600 font-medium">{detail.titleValue}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-[15px]">
                              {detail.naibAmeer && (
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-primary/90 uppercase tracking-wider flex items-center gap-1.5"><User className="w-4 h-4" /> {detail.leaderTitle || 'Ameer'}</span>
                                  <span className="block font-semibold text-slate-800">{detail.naibAmeer}</span>
                                </div>
                              )}
                              {detail.address && (
                                <div className="space-y-1 md:col-span-2">
                                  <span className="text-sm font-bold text-primary/90 uppercase tracking-wider flex items-center gap-1.5"><MapPinned className="w-4 h-4" /> Postal Address</span>
                                  <span className="block font-medium text-slate-800 leading-relaxed line-clamp-2">
                                    {detail.addressUrl ? (
                                      <a href={detail.addressUrl} target={detail.addressUrlNewTab !== false ? "_blank" : "_self"} className="hover:text-[#0d5844] transition-colors hover:underline decoration-slate-300 underline-offset-4">
                                        {detail.address}
                                      </a>
                                    ) : (
                                      detail.address
                                    )}
                                  </span>
                                </div>
                              )}
                              {detail.phone && (
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-primary/90 uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-4 h-4" /> Phone</span>
                                  <span className="block font-semibold text-slate-800">
                                    {detail.phoneUrl ? (
                                      <a href={detail.phoneUrl} target={detail.phoneUrlNewTab !== false ? "_blank" : "_self"} className="hover:text-[#0d5844] transition-colors">{detail.phone}</a>
                                    ) : (
                                      detail.phone
                                    )}
                                  </span>
                                </div>
                              )}
                              {detail.mobile && (
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-primary/90 uppercase tracking-wider flex items-center gap-1.5"><MessagesSquare className="w-4 h-4" /> Whatsapp</span>
                                  <span className="block font-semibold text-slate-800">
                                    {detail.mobileUrl ? (
                                      <a href={detail.mobileUrl} target={detail.mobileUrlNewTab !== false ? "_blank" : "_self"} className="hover:text-[#0d5844] transition-colors">{detail.mobile}</a>
                                    ) : (
                                      detail.mobile
                                    )}
                                  </span>
                                </div>
                              )}
                              {detail.email && (
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-primary/90 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email</span>
                                  <span className="block font-semibold text-slate-800">
                                    <a href={detail.emailUrl || `mailto:${detail.email}`} target={detail.emailUrlNewTab !== false ? "_blank" : "_self"} className="hover:text-[#0d5844] transition-colors">{detail.email}</a>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!branch.phone && !branch.city && (!branch.details || branch.details.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <Building2 className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-[14px] text-slate-500 max-w-sm">
                          Contact details will be available soon. Please email <a href="mailto:markaz@tanzeem.org" className="text-[#0d5844] font-bold hover:underline">markaz@tanzeem.org</a> for assistance.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
