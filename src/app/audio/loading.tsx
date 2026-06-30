export default function AudioLoading() {
  return (
    <div className="container max-w-7xl mx-auto py-10">
      {/* Header skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-24 bg-muted rounded-full animate-pulse" />
        <div className="h-9 w-72 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      </div>
      {/* Search bar skeleton */}
      <div className="h-10 w-full max-w-lg bg-muted rounded-xl animate-pulse mb-6" />
      {/* Filter pill skeletons */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-video bg-muted rounded-xl animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
