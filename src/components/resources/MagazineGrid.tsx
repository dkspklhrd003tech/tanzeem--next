import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MagazineItem = {
  id: string;
  title: string;
  issueNumber?: string | null;
  coverImage?: string | null;
  fileUrl?: string | null;
  publishDate?: Date | string | null;
};

export function MagazineGrid({ items, seriesTitle }: { items: MagazineItem[]; seriesTitle?: string }) {
  return (
    <div>
      {seriesTitle && (
        <h2 className="font-amiri text-2xl font-bold text-primary mb-6">{seriesTitle}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((issue) => (
          <article key={issue.id} className="border border-border rounded-md overflow-hidden bg-card">
            <div className="aspect-[3/4] bg-muted">
              {issue.coverImage ? (
                <img src={issue.coverImage} alt={issue.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-amiri text-lg p-4 text-center">
                  {issue.title}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm">{issue.title}</h3>
              {issue.issueNumber && (
                <p className="text-xs text-foreground-muted">Issue {issue.issueNumber}</p>
              )}
              {issue.fileUrl && (
                <Button asChild size="sm" variant="outline" className="mt-2 w-full">
                  <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    PDF
                  </a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
