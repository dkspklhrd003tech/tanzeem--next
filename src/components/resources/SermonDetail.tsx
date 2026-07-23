import Link from "next/link";
import { WaveformPlayer } from "./WaveformPlayer";

type SermonRecord = {
    id: string;
    title: string;
    slug: string;
    speakerName: string | null;
    sermonDate: Date | null;
    thumbnailUrl: string | null;
    audioUrl: string | null;
    videoUrl: string | null;
    description: string | null;
    isPublished: boolean;
};

interface SermonDetailProps {
    sermon: SermonRecord;
}

function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}`;
}

export function SermonDetail({ sermon }: SermonDetailProps) {
    const {
        title,
        speakerName,
        sermonDate,
        thumbnailUrl,
        audioUrl,
        videoUrl,
        description,
    } = sermon;

    const isYouTube =
        videoUrl !== null &&
        (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));

    const embedUrl = isYouTube && videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

    return (
        <article className="container mx-auto px-4 sm:px-6 py-14 md:py-8 max-w-4xl">
            {/* Header */}
            <header>
                {sermonDate && (
                    <p className="text-sm text-foreground-muted">
                        {sermonDate.toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                )}
                <h1 className="font-nastaleeq text-3xl md:text-4xl text-primary font-bold mt-2">
                    {title}
                </h1>
                <p className="text-foreground-muted mt-1">
                    {speakerName || "Tanzeem-e-Islami"}
                </p>
            </header>

            {/* Thumbnail */}
            {thumbnailUrl && (
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full rounded-lg mt-6 aspect-video object-cover"
                />
            )}

            {/* Audio Player */}
            {audioUrl && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-foreground mb-3">Audio</h2>
                    <WaveformPlayer
                        audioUrl={audioUrl}
                        title={title}
                        speakerName={speakerName || undefined}
                        publishedAt={sermonDate}
                    />
                </div>
            )}

            {/* YouTube Video Embed */}
            {embedUrl && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-foreground mb-3">Video</h2>
                    <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                            src={embedUrl}
                            title={title}
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}

            {/* Description */}
            {description && (
                <div
                    className="prose prose-lg  max-w-none mt-8"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}

            {/* Back Link */}
            <Link
                href="/resources/khitab-e-jumah"
                className="inline-flex items-center gap-2 text-primary hover:underline mt-8"
            >
                ← Back to Khitab-e-Jum&apos;ah
            </Link>
        </article>
    );
}
