export const metadata = { title: "Videos by Speakers | Tanzeem-e-Islami" };

const speakers = [
  { title: "Dr. Israr Ahmed", href: "/resources/videos/by-speakers/dr-israr-ahmed", description: "Founder of Tanzeem-e-Islami", count: 500 },
  { title: "Shujauddin Sheikh", href: "/resources/videos/by-speakers/shujauddin-sheikh", description: "Current Ameer of Tanzeem-e-Islami", count: 200 },
  { title: "Other Speakers", href: "/resources/videos/by-speakers/other", description: "Guest scholars and speakers", count: 100 },
];

export default function VideosBySpeakersPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Videos by Speakers</h1>
        <p className="text-lg text-muted-foreground mb-8">Explore video lectures and talks organized by speaker.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {speakers.map((sp) => (
            <a
              key={sp.href}
              href={sp.href}
              className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {sp.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{sp.description}</p>
              <span className="text-xs text-primary font-medium">{sp.count} videos</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
