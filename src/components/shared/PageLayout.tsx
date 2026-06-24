export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8">
        {children}
      </div>
    </main>
  );
}
