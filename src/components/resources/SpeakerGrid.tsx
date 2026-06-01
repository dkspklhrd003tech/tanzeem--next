import Link from "next/link";
import { Headphones } from "lucide-react";

export type SpeakerItem = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
  audioCount?: number;
};

export function SpeakerGrid({ speakers }: { speakers: SpeakerItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {speakers.map((speaker) => (
        <Link
          key={speaker.id}
          href={`/resources/audios/by-speaker?speaker=${speaker.id}`}
          className="group border border-border rounded-md p-4 bg-card hover:border-primary/40 text-center transition-colors"
        >
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-primary/10 mb-3">
            {speaker.avatar ? (
              <img src={speaker.avatar} alt={speaker.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-amiri text-primary">
                {speaker.name.charAt(0)}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm group-hover:text-primary">{speaker.name}</h3>
          {speaker.audioCount !== undefined && (
            <p className="text-xs text-foreground-muted mt-1 flex items-center justify-center gap-1">
              <Headphones className="h-3 w-3" />
              {speaker.audioCount} lectures
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
