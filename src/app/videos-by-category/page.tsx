export const metadata = { title: "Videos by Category | Tanzeem-e-Islami" };

const categories = [
  { title: "Bayan-ul-Quran", href: "/resources/videos/by-category/bayan-ul-quran", description: "Quran commentary video series", count: 150 },
  { title: "Khitab-e-Jum'ah", href: "/resources/videos/by-category/khitab-e-jumah", description: "Friday sermon videos", count: 80 },
  { title: "Zamana Gawah Hai", href: "/resources/videos/by-category/zamana-gawah-hai", description: "Islamic talk show episodes", count: 60 },
  { title: "Ameer Say Mulaqat", href: "/resources/videos/by-category/ameer-say-mulaqat", description: "Meetings with the Ameer", count: 40 },
  { title: "Policy Statements", href: "/resources/videos/by-category/policy-statements", description: "Organizational policy addresses", count: 30 },
  { title: "Seminars & Conferences", href: "/resources/videos/by-category/seminars", description: "Recorded seminar presentations", count: 100 },
  { title: "Dars-e-Quran", href: "/resources/videos/by-category/dars-e-quran", description: "Quran study circles", count: 200 },
  { title: "Tazkeer", href: "/resources/videos/by-category/tazkeer", description: "Short reminder videos", count: 50 },
];

export default function VideosByCategoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Videos by Category</h1>
        <p className="text-lg text-muted-foreground mb-8">Explore our collection of Islamic videos organized by category.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <a
              key={cat.href}
              href={cat.href}
              className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
              <span className="text-xs text-primary font-medium">{cat.count} videos</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
