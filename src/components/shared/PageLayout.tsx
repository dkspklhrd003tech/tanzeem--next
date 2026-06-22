export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        {children}
      </div>
    </main>
  );
}
