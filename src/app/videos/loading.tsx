export default function VideosLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-3 w-24 bg-muted rounded-full animate-pulse" />
        <div className="h-9 w-72 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full max-w-lg bg-muted rounded-xl animate-pulse mb-6" />
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
