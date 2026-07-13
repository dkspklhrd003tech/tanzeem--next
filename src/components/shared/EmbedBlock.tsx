"use client";

interface EmbedBlockProps {
  source: string; // URL for YouTube or Iframe
  aspectRatio?: "video" | "square" | "wide";
  caption?: string;
}

export function EmbedBlock({ source, aspectRatio = "video", caption }: EmbedBlockProps) {
  // Convert standard YouTube URL to Embed URL if needed
  let embedUrl = source;
  if (source.includes("youtube.com/watch?v=")) {
    embedUrl = source.replace("watch?v=", "embed/");
  } else if (source.includes("youtu.be/")) {
    embedUrl = source.replace("youtu.be/", "www.youtube.com/embed/");
  }

  const ratioClasses = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[21/9]",
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className={`relative w-full overflow-hidden rounded-xl shadow-2xl bg-black ${ratioClasses[aspectRatio]}`}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded Media"
          />
        </div>
        {caption && (
          <p className="mt-6 text-center text-foreground-muted italic font-medium">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
