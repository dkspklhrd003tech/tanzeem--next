export const metadata = { title: "Event Categories | Tanzeem-e-Islami" };

const categories = [
  { title: "Annual Conference", href: "/events/category/annual-conference", description: "Annual gatherings with key addresses and sessions", count: "5 events" },
  { title: "Dars-e-Quran", href: "/events/category/dars-e-quran", description: "Regular Quran study circle events", count: "100+ events" },
  { title: "Seminar", href: "/events/category/seminar", description: "Topical seminars on contemporary issues", count: "30 events" },
  { title: "Training Program", href: "/events/category/training", description: "Skill development and capacity building", count: "20 events" },
  { title: "Public Lecture", href: "/events/category/public-lecture", description: "Open lectures for the general public", count: "50 events" },
  { title: "Webinar", href: "/events/category/webinar", description: "Online educational sessions", count: "40 events" },
];

export default function EventCategoriesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Event Categories</h1>
        <p className="text-lg text-muted-foreground mb-8">Explore Tanzeem-e-Islami events organized by category.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
              <span className="text-xs text-primary font-medium">{cat.count}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
