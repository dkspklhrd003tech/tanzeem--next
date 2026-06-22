export const metadata = { title: "Events | Tanzeem-e-Islami" };

const cards = [
  { title: "Upcoming Events", href: "/events/upcoming", description: "View upcoming events and programs" },
  { title: "Past Events", href: "/events/past", description: "Browse recordings of past events" },
  { title: "Event Categories", href: "/events/categories", description: "Browse events by category" },
  { title: "Event Locations", href: "/events/locations", description: "Find events near you" },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Events</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Stay informed about Tanzeem-e-Islami&apos;s events, seminars, conferences, and public programs.
          </p>
          <p className="text-muted-foreground mb-8">
            Tanzeem-e-Islami regularly organizes events including seminars, conferences, public lectures,
            and training programs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
