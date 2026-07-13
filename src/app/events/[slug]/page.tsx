import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ArrowLeft, Calendar, MapPin, Clock, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await db.query.events.findFirst({
    where: and(eq(events.slug, slug), eq(events.isPublished, true)),
  });
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | Tanzeem-e-Islami`,
    description: event.description || undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await db.query.events.findFirst({
    where: and(eq(events.slug, slug), eq(events.isPublished, true)),
  });

  if (!event) notFound();

  return (
    <main className=" bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> All Events
        </Link>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {event.thumbnailUrl && (
              <img
                src={event.thumbnailUrl}
                alt={event.title}
                className="w-full aspect-video rounded-xl object-cover shadow-lg mb-8"
              />
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {event.startDate
                  ? new Date(event.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "TBA"}
                {event.endDate &&
                  ` — ${new Date(event.endDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {event.startDate
                  ? new Date(event.startDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "TBA"}
              </span>
              {event.isOnline ? (
                <span className="flex items-center gap-2 text-primary">
                  <Globe className="h-4 w-4" /> Online Event
                </span>
              ) : event.location ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {event.location}
                </span>
              ) : null}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="prose prose-lg  max-w-none mb-8">
              <p>{event.description}</p>
            </div>
          )}

          {/* Content */}
          {event.content && (
            <div
              className="prose prose-lg  max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
          )}

          {/* Address */}
          {event.address && !event.isOnline && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </h3>
              <p className="text-muted-foreground">{event.address}</p>
            </div>
          )}

          {/* Registration */}
          {event.registrationRequired && event.registrationUrl && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Registration Required</h3>
              <Button asChild>
                <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  Register Now <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          {/* Online URL */}
          {event.isOnline && event.onlineUrl && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Join Online</h3>
              <Button asChild variant="default">
                <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Join Event
                </a>
              </Button>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
