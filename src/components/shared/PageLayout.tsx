export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16 px-4">
        {children}
      </div>
    </main>
  );
}
