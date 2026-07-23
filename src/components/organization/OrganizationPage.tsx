"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, User, BookOpen, Star, Compass, Target,
  MapPin, Phone, Building2,
} from "lucide-react";
import { cn, resolveMediaUrl } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroBannerState {
  topLabel: string;
  quoteText: string;
  attribution: string;
  backgroundImage: string;
  decorativeImage: string;
}

export interface HistoryState {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  sideImage: string;
}

export interface MissionStatementState {
  heading: string;
  subheading: string;
  body: string;
}

export interface LeaderState {
  name: string;
  designation: string;
  bio: string;
  avatar: string;
  readMoreLabel: string;
  readMoreUrl: string;
}

export interface IdeologyCardState {
  icon: string;
  title: string;
  urduTitle: string;
  description: string;
  linkLabel: string;
  linkUrl: string;
}

export interface IdeologyState {
  heading: string;
  cards: IdeologyCardState[];
}

export interface JoinCardState {
  title: string;
  location: string;
  phone: string;
  description: string;
  linkLabel: string;
  linkUrl: string;
}

export interface JoinState {
  heading: string;
  subtitle: string;
  cards: JoinCardState[];
}

export interface OrganizationPageState {
  heroBanner: HeroBannerState;
  history: HistoryState;
  missionStatement: MissionStatementState;
  founder: LeaderState;
  ameer: LeaderState;
  ideology: IdeologyState;
  join: JoinState;
}

// ─── Icon Registry ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  book: BookOpen,
  star: Star,
  compass: Compass,
  target: Target,
  building: Building2,
};

const ICON_CYCLE: LucideIcon[] = [BookOpen, Star, Compass, Target];

// ─── LocalStorage Key ─────────────────────────────────────────────────────────

const LS_KEY = "tanzeem_org_page_organization";

// ─── Empty / Placeholder State ────────────────────────────────────────────────

export const EMPTY_STATE: OrganizationPageState = {
  heroBanner: {
    topLabel: "",
    quoteText: "",
    attribution: "",
    backgroundImage: "",
    decorativeImage: "",
  },
  history: {
    heading: "",
    body: "",
    buttonLabel: "",
    buttonUrl: "",
    sideImage: "",
  },
  missionStatement: {
    heading: "",
    subheading: "",
    body: "",
  },
  founder: {
    name: "",
    designation: "",
    bio: "",
    avatar: "",
    readMoreLabel: "",
    readMoreUrl: "",
  },
  ameer: {
    name: "",
    designation: "",
    bio: "",
    avatar: "",
    readMoreLabel: "",
    readMoreUrl: "",
  },
  ideology: {
    heading: "",
    cards: [],
  },
  join: {
    heading: "",
    subtitle: "",
    cards: [],
  },
};

// ─── Hook to load state ───────────────────────────────────────────────────────

export function useOrganizationPageState(initialData?: OrganizationPageState | null) {
  const [state, setState] = useState<OrganizationPageState>(initialData || EMPTY_STATE);
  const [loaded, setLoaded] = useState(!!initialData);

  useEffect(() => {
    if (initialData) {
      setLoaded(true);
      return;
    }

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OrganizationPageState;
        setState(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [initialData]);

  const save = useCallback((next: OrganizationPageState) => {
    setState(next);
    // We still save to localStorage as a fallback backup during edits
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }, []);

  return { state, save, loaded };
}

// ─── Section Components ───────────────────────────────────────────────────────

/* ① HERO BANNER */
function HeroBanner({ data }: { data: HeroBannerState }) {
  const hasContent = data.quoteText || data.topLabel;
  if (!hasContent && !data.backgroundImage) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 320 }}>
      {/* Background */}
      {data.backgroundImage ? (
        <div
          className="absolute inset-0 z-0 bg-contain bg-center"
          style={{ backgroundImage: `url('${resolveMediaUrl(data.backgroundImage)}')` }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-primary" aria-hidden="true" />
      )}


      {/* Decorative Islamic geometry – right side */}
      {data.decorativeImage && (
        <div className="absolute right-0 top-0 h-full w-1/3 z-10 opacity-30 pointer-events-none">
          <img
            src={resolveMediaUrl(data.decorativeImage)}
            alt=""
            className="h-full w-full object-cover object-left"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="container relative z-20 px-4 py-8 md:py-20 text-center flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ minHeight: 320 }}
      >
        {data.topLabel && (
          <p className="text-white/60 text-xs md:text-sm uppercase tracking-[0.25em] mb-4 font-semibold">
            {data.topLabel}
          </p>
        )}
        {data.quoteText && (
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug max-w-4xl drop-shadow-lg uppercase tracking-wide">
            {data.quoteText}
          </h1>
        )}
        {data.attribution && (
          <p className="mt-5 text-white/80 text-sm md:text-base font-semibold">
            {data.attribution}
          </p>
        )}
      </motion.div>
    </section>
  );
}

/* ② OUR HISTORY */
function OurHistory({ data }: { data: HistoryState }) {
  if (!data.heading && !data.body) return null;

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Text */}
          <div className="flex-1 space-y-5">
            {data.heading && (
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-foreground"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {data.heading}
              </motion.h2>
            )}
            {data.body && (
              <div
                className="prose prose-base  max-w-none prose-p:text-foreground-muted prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.body }}
              />
            )}
            {data.buttonLabel && data.buttonUrl && (
              <div className="pt-2">
                <Link
                  href={data.buttonUrl}
                  className={cn(
                    "inline-flex items-center gap-2 border border-primary text-primary",
                    "px-6 py-2.5 rounded-full text-sm font-semibold",
                    "hover:bg-primary hover:text-primary-foreground transition-colors",
                  )}
                >
                  {data.buttonLabel}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          {/* Side image */}
          {data.sideImage && (
            <div className="md:w-80 shrink-0">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={resolveMediaUrl(data.sideImage)}
                  alt="Our History"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ③ MISSION STATEMENT */
function MissionStatement({ data }: { data: MissionStatementState }) {
  if (!data.heading && !data.body) return null;

  return (
    <section className="py-14 md:py-20 bg-background-secondary border-t border-border">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {data.heading && (
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {data.heading}
            </h2>
          )}
          {data.subheading && (
            <p className="section-label mb-2 text-sm">{data.subheading}</p>
          )}
          {data.body && (
            <div
              className="prose prose-base  max-w-none prose-p:text-foreground-muted prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ④ LEADER BIO (shared for Founder & Ameer) */
function LeaderBio({ data }: { data: LeaderState }) {
  if (!data.name && !data.bio) return null;

  return (
    <section className="py-14 bg-background border-t border-border">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-0">
            {/* Photo panel */}
            <div className="md:w-64 shrink-0 bg-muted flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border">
              <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-primary/20 bg-background">
                {data.avatar ? (
                  <img
                    src={resolveMediaUrl(data.avatar)}
                    alt={data.name || "Leader photo"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                    <User className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Content panel */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
              <div>
                {data.designation && (
                  <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">
                    {data.designation}
                  </p>
                )}
                {data.name && (
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {data.name}
                  </h2>
                )}
                {data.bio && (
                  <div
                    className="prose prose-base  max-w-none
                      prose-p:text-foreground-muted prose-p:leading-relaxed
                      prose-headings:text-foreground prose-a:text-primary
                      prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: data.bio }}
                  />
                )}
              </div>

              {data.readMoreUrl && (
                <div>
                  <Link
                    href={data.readMoreUrl}
                    className={cn(
                      "inline-flex items-center gap-2 border border-primary text-primary",
                      "px-5 py-2 rounded-full text-sm font-semibold",
                      "hover:bg-primary hover:text-primary-foreground transition-colors",
                    )}
                  >
                    {data.readMoreLabel || "Read More"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ⑤ OUR IDEOLOGY CARDS */
function IdeologySection({ data }: { data: IdeologyState }) {
  if (!data.heading && data.cards.length === 0) return null;

  return (
    <section aria-labelledby="org-ideology-heading" className="py-14 bg-background border-t border-border">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {data.heading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="section-label mb-2 text-sm">Our Ideology</p>
            <h2
              id="org-ideology-heading"
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              {data.heading}
            </h2>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.cards.map((card, i) => {
            const Icon = ICON_MAP[card.icon] ?? ICON_CYCLE[i % ICON_CYCLE.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  "bg-card border border-border rounded-xl p-6",
                  "flex flex-col items-center text-center gap-4",
                  "hover:shadow-mid transition-shadow duration-300",
                )}
              >
                {/* Icon circle */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>

                {/* Titles */}
                <div>
                  {card.title && (
                    <h3 className="font-bold text-foreground text-base mb-0.5">
                      {card.title}
                    </h3>
                  )}
                  {card.urduTitle && (
                    <p className="text-primary/70 text-sm font-nastaleeq" dir="rtl" lang="ur">
                      {card.urduTitle}
                    </p>
                  )}
                </div>

                {/* Description */}
                {card.description && (
                  <p className="text-foreground text-sm leading-relaxed flex-1">
                    {card.description}
                  </p>
                )}

                {/* CTA */}
                {card.linkUrl && (
                  <Link
                    href={card.linkUrl}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-semibold text-primary",
                      "border border-primary/30 rounded-full px-4 py-1.5",
                      "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                      "transition-colors duration-200",
                    )}
                  >
                    {card.linkLabel || "Learn More"}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ⑥ JOIN US */
function JoinUS({ data }: { data: JoinState }) {
  if (!data.heading && data.cards.length === 0) return null;

  return (
    <section className="py-8 relative overflow-hidden" style={{ backgroundColor: "#0d5844" }}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/3 blur-3xl bg-white" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-[0.06] translate-y-1/3 -translate-x-1/4 blur-3xl bg-white" aria-hidden="true" />

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {data.heading && (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {data.heading}
            </h2>
          )}
          {data.subtitle && (
            <p className="mt-3 text-white/70 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              {data.subtitle}
            </p>
          )}
        </motion.div>

        {data.cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {data.cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center"
              >
                {card.title && (
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                )}
                {card.location && (
                  <p className="text-white/70 text-xs flex items-center justify-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {card.location}
                  </p>
                )}
                {card.phone && (
                  <p className="text-white/70 text-xs flex items-center justify-center gap-1.5 mb-3">
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    {card.phone}
                  </p>
                )}
                {card.description && (
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{card.description}</p>
                )}
                {card.linkUrl && (
                  <Link
                    href={card.linkUrl}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold",
                      "border-2 border-white text-white",
                      "hover:bg-white hover:text-[#0d5844] transition-colors",
                    )}
                  >
                    {card.linkLabel || "Join Now"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function OrganizationPageClient({ initialData }: { initialData?: OrganizationPageState }) {
  const { state, loaded } = useOrganizationPageState(initialData);

  if (!loaded) {
    return (
      <main className=" bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className=" bg-background">
      <OurHistory data={state.history} />
      <MissionStatement data={state.missionStatement} />
      <LeaderBio data={state.founder} />
      <LeaderBio data={state.ameer} />
      <IdeologySection data={state.ideology} />
      <JoinUS data={state.join} />
    </main>
  );
}
