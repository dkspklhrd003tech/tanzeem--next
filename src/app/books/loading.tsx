export default function BooksLoading() {
  return (
    <div className="container max-w-7xl mx-auto py-10">
      <div className="mb-8 space-y-2">
        <div className="h-3 w-24 bg-muted rounded-full animate-pulse" />
        <div className="h-9 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-36 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-full max-w-lg bg-muted rounded-xl animate-pulse mb-6" />
      <div className="flex gap-2 mb-4 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-20 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-28 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-full rounded-xl bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
