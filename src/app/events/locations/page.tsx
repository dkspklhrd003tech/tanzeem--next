export const metadata = { title: "Event Locations | Tanzeem-e-Islami" };

const locations = [
  { title: "Markaz Tanzeem, Lahore", href: "/events/location/markaz-tanzeem", description: "Main headquarters in Johar Town, Lahore", address: "67-A, Johar Town, Lahore" },
  { title: "Quran Academy, Lahore", href: "/events/location/quran-academy", description: "Quran educational center", address: "Lahore" },
  { title: "Online (Virtual)", href: "/events/location/online", description: "Webinar and live-streamed events", address: "Global" },
  { title: "Karachi Center", href: "/events/location/karachi", description: "Tanzeem-e-Islami Karachi office", address: "Karachi, Sindh" },
  { title: "Islamabad Office", href: "/events/location/islamabad", description: "Islamabad regional office", address: "Islamabad" },
];

export default function EventLocationsPage() {
  return (
    <main className=" bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Event Locations</h1>
        <p className="text-lg text-muted-foreground mb-8">Discover Tanzeem-e-Islami events happening at various locations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {locations.map((loc) => (
            <a
              key={loc.href}
              href={loc.href}
              className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {loc.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{loc.description}</p>
              <p className="text-xs text-muted-foreground">{loc.address}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
