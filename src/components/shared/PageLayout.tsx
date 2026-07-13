export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className=" bg-background">
      <div className="container mx-auto py-6 md:py-8">
        {children}
      </div>
    </main>
  );
}
