import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type HubCard = {
  title: string;
  description?: string;
  href: string;
  external?: boolean;
  titleUrdu?: string;
};

type HubLandingProps = {
  title: string;
  subtitle?: string;
  cards: HubCard[];
};

export function HubLanding({ title, subtitle, cards }: HubLandingProps) {
  return (
    <div className="container mx-auto py-8 md:py-10 px-4">
      <div className="max-w-4xl mb-10">
        <h1 className="font-amiri text-3xl md:text-4xl text-primary font-bold">{title}</h1>
        {subtitle && <p className="mt-3 text-foreground-muted leading-relaxed">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const isExternal = card.external || card.href.startsWith("http");
          const className = cn(
            "group flex flex-col bg-card border border-border rounded-md p-6 hover:border-primary/40 hover:shadow-md transition-all"
          );
          const inner = (
            <>
              {card.titleUrdu && (
                <span dir="rtl" className="font-urdu text-primary text-lg mb-1 block">
                  {card.titleUrdu}
                </span>
              )}
              <h2 className="font-semibold text-lg text-foreground group-hover:text-primary flex items-center gap-2">
                {card.title}
                {isExternal && <ExternalLink className="h-4 w-4 text-foreground-muted" />}
              </h2>
              {card.description && (
                <p className="mt-2 text-sm text-foreground-muted flex-1">{card.description}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {isExternal ? "Visit" : "Read more"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </>
          );
          return isExternal ? (
            <a
              key={card.href}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <Link key={card.href} href={card.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
