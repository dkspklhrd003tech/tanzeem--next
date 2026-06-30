export default function MagazinesLoading() {
  return (
    <div className="container max-w-7xl mx-auto py-10">
      <div className="mb-10 space-y-2">
        <div className="h-3 w-28 bg-muted rounded-full animate-pulse" />
        <div className="h-9 w-72 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
      {[0, 1].map((s) => (
        <div key={s} className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <div className="h-7 w-40 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full rounded-xl bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
