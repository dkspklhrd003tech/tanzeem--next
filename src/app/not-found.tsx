import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4 py-16">
        <div className="mb-8">
          <span className="text-8xl font-bold text-primary/20">404</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
          >
            Search Site
          </Link>
        </div>
      </div>
    </main>
  );
}
