import React from "react";
// PageHero is the static banner version for inner pages.
// The carousel Hero component is only used on the homepage (src/app/page.tsx directly).
import { PageHero } from "@/components/shared/PageHero";
import { IntroSection } from "@/components/shared/IntroSection";
import { StatsGrid } from "@/components/shared/StatsGrid";
import { Accordion } from "@/components/shared/Accordion";
import { TeamGrid } from "@/components/shared/TeamGrid";
import { MediaCardGrid } from "@/components/shared/MediaCardGrid";
import { PublicationGrid } from "@/components/shared/PublicationGrid";
import { CTABanner } from "@/components/shared/CTABanner";
import { EmbedBlock } from "@/components/shared/EmbedBlock";
import { TextBlock } from "@/components/shared/TextBlock";
import { ImageText } from "@/components/shared/ImageText";
import { QuoteBanner } from "@/components/shared/QuoteBanner";
import { LeaderBio } from "@/components/shared/LeaderBio";
import { IdeologyCards } from "@/components/shared/IdeologyCards";
import { JoinCTA } from "@/components/shared/JoinCTA";
import { NestedCategoryGrid } from "@/components/shared/NestedCategoryGrid";
import type { CmsSectionData } from "@/lib/page-helpers";

const ComponentMap: Record<string, React.FC<any>> = {
  // "hero" on inner pages = static page banner, NOT the carousel slider
  hero: PageHero,
  intro: IntroSection,
  stats: StatsGrid,
  accordion: Accordion,
  team: TeamGrid,
  media_grid: MediaCardGrid,
  publications: PublicationGrid,
  cta_banner: CTABanner,
  embed: EmbedBlock,
  text_block: TextBlock,
  image_text: ImageText,
  quote_banner: QuoteBanner,
  leader_bio: LeaderBio,
  ideology_cards: IdeologyCards,
  join_cta: JoinCTA,
  nested_category_grid: NestedCategoryGrid,
};

interface DynamicPageContentProps {
  sections: CmsSectionData[];
}

export function DynamicPageContent({ sections }: DynamicPageContentProps) {
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        const SectionComponent = ComponentMap[section.type];
        if (!SectionComponent) {
          console.warn(`No component found for section type: ${section.type}`);
          return null;
        }
        return (
          <SectionComponent
            key={section.id}
            {...(section.config as any)}
          />
        );
      })}
    </div>
  );
}

export function generatePageMetadata(
  page: { title: string; metaTitle?: string | null; metaDescription?: string | null; excerpt?: string | null } | null,
  defaultTitle: string,
  defaultDescription?: string
) {
  const SITE_NAME = "Tanzeem-e-Islami";
  if (page?.metaTitle || page?.title) {
    const rawTitle = page.metaTitle || page.title;
    const cleanTitle = rawTitle.replace(new RegExp(`\\s*\\|?\\s*${SITE_NAME}\\s*$`, 'i'), '').trim();
    const fullTitle = cleanTitle ? `${cleanTitle} | ${SITE_NAME}` : SITE_NAME;
    const description = page.metaDescription || page.excerpt || defaultDescription;
    return {
      title: cleanTitle || undefined,
      description,
      openGraph: {
        title: fullTitle,
        description: description ?? undefined,
      },
    };
  }
  const cleanDefaultTitle = defaultTitle.replace(new RegExp(`\\s*\\|?\\s*${SITE_NAME}\\s*$`, 'i'), '').trim();
  const fullDefaultTitle = cleanDefaultTitle ? `${cleanDefaultTitle} | ${SITE_NAME}` : defaultTitle;
  return {
    title: cleanDefaultTitle || undefined,
    description: defaultDescription,
    openGraph: {
      title: fullDefaultTitle,
      description: defaultDescription,
    },
  };
}
