import Link from "next/link";
import { PlayCircle, MessageSquare } from "lucide-react";

type SermonRecord = {
    id: string;
    title: string;
    slug: string;
    speakerName: string | null;
    sermonDate: Date | null;
    thumbnailUrl: string | null;
    audioUrl: string | null;
    videoUrl: string | null;
    isPublished: boolean;
};

interface SermonsListProps {
    sermons: SermonRecord[];
}

export function SermonsList({ sermons }: SermonsListProps) {
    return (
        <section aria-labelledby="sermons-heading" className="py-14 md:py-16">
            <div className="container mx-auto">
                <h1
                    id="sermons-heading"
                    className="font-amiri text-3xl md:text-4xl text-primary font-bold mb-8"
                >
                    Khitab-e-Jum&apos;ah
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sermons.length === 0 ? (
                        <div className="col-span-3 py-16 text-center text-foreground-muted">
                            <MessageSquare
                                className="h-12 w-12 mx-auto mb-3 opacity-30"
                                aria-hidden="true"
                            />
                            <p>No sermons available yet. Please check back soon.</p>
                        </div>
                    ) : (
                        sermons.map((sermon) => (
                            <article
                                key={sermon.id}
                                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                {sermon.thumbnailUrl ? (
                                    <img
                                        src={sermon.thumbnailUrl}
                                        alt={sermon.title}
                                        className="aspect-video object-cover w-full"
                                    />
                                ) : (
                                    <div className="aspect-video bg-muted flex items-center justify-center">
                                        <MessageSquare
                                            className="h-10 w-10 text-foreground-muted opacity-40"
                                            aria-hidden="true"
                                        />
                                    </div>
                                )}

                                {/* Card body */}
                                <div className="p-5">
                                    {/* Date */}
                                    <p className="text-xs text-foreground-muted">
                                        {sermon.sermonDate
                                            ? sermon.sermonDate.toLocaleDateString("en-PK", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "—"}
                                    </p>

                                    {/* Title */}
                                    <h2 className="text-lg font-bold text-foreground mt-1 line-clamp-2">
                                        {sermon.title}
                                    </h2>

                                    {/* Speaker */}
                                    <p className="text-sm text-foreground-muted mt-1">
                                        {sermon.speakerName || "Tanzeem-e-Islami"}
                                    </p>

                                    {/* Link / play button */}
                                    {sermon.audioUrl ? (
                                        <Link
                                            href={`/resources/khitab-e-jumah/${sermon.slug}`}
                                            aria-label={`Play: ${sermon.title}`}
                                            className="mt-3 inline-block"
                                        >
                                            <PlayCircle className="h-8 w-8 text-primary" />
                                        </Link>
                                    ) : sermon.videoUrl ? (
                                        <Link
                                            href={`/resources/khitab-e-jumah/${sermon.slug}`}
                                            className="text-sm text-primary hover:underline mt-2 inline-block"
                                        >
                                            Listen / Watch
                                        </Link>
                                    ) : null}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
