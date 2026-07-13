import Link from "next/link";
import { AudioLines, Calendar, MessageSquare } from "lucide-react";

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
    titleUrdu?: string | null;
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
                        sermons.map((sermon) => {
                            const formattedDate = sermon.sermonDate
                                ? sermon.sermonDate.toLocaleDateString("en-PK", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }).toUpperCase()
                                : "RECENT";

                            return (
                                <Link key={sermon.id}
                                    href={`/resources/khitab-e-jumah/${sermon.slug}`}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-border/50 hover:border-primary/50 bg-primary-light/80 hover:bg-muted/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full"
                                >
                                    <div className="flex-1">
                                        <div className="flex flex-col items-start gap-1 mb-1">
                                            {/* Date Pill */}
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0d5844]/10 text-[#0d5844] text-[10px] sm:text-xs font-bold mb-1 w-fit">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formattedDate}</span>
                                            </div>
                                            <h3 className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors uppercase leading-snug line-clamp-2">
                                                {sermon.title}
                                            </h3>
                                            {sermon.titleUrdu && (
                                                <h4 className="font-bold text-xl tracking-wider text-foreground font-nastaleeq mt-1 line-clamp-1" dir="rtl">{sermon.titleUrdu}</h4>
                                            )}
                                            {sermon.speakerName && (
                                                <p className="text-sm text-foreground-muted mt-2">{sermon.speakerName}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-center justify-center gap-1 mt-2 md:mt-0">
                                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all scale-95 group-hover:scale-100 shadow-sm shrink-0">
                                            <AudioLines className="w-7 h-7" />
                                        </button>
                                        <span className="text-[11px] text-foreground font-medium transition-opacity hidden md:block">Listen Now</span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
