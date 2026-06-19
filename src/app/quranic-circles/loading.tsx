export default function QuranicCirclesLoading() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-3 w-32 bg-muted rounded-full animate-pulse" />
        <div className="h-9 w-80 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
      </div>
      {/* Filter panel skeleton */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      {/* City pills skeleton */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="h-14 bg-muted animate-pulse" />
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex gap-3 items-start">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse shrink-0 mt-0.5" />
                  <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
