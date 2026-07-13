export const metadata = { title: "Past Events | Tanzeem-e-Islami" };

const pastEvents = [
  { title: "Dora-e-Turjuma-e-Quran 2025", slug: "dora-e-turjuma-e-quran-2025", date: "December 2025", location: "Markaz Tanzeem, Lahore", description: "Annual Quran translation and study intensive program." },
  { title: "Annual Conference 2025", slug: "annual-conference-2025", date: "March 2025", location: "Markaz Tanzeem, Lahore", description: "Annual conference with national and international speakers." },
  { title: "Khitab-e-Jum'ah Special Series", slug: "khitab-e-jumah-special-series-2024", date: "2024-2025", location: "Markaz Tanzeem, Lahore", description: "Special Friday sermon series on contemporary issues." },
];

export default function PastEventsPage() {
  return (
    <main className=" bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Past Events</h1>
        <p className="text-lg text-muted-foreground mb-8">Browse recordings and summaries of past events.</p>
        <div className="max-w-4xl mx-auto space-y-6">
          {pastEvents.map((event, i) => (
            <a key={i} href={`/events/${event.slug}`} className="block bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{event.date}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">📍 {event.location}</p>
              <p className="text-muted-foreground">{event.description}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
