export const metadata = { title: "Upcoming Events | Tanzeem-e-Islami" };

const upcomingEvents = [
  { title: "Annual Conference 2026", slug: "annual-conference-2026", date: "March 15-17, 2026", time: "9:00 AM - 5:00 PM", location: "Markaz Tanzeem, Lahore", description: "Three-day annual conference featuring keynote addresses, workshops, and networking sessions." },
  { title: "Dars-e-Quran Weekly Circle", slug: "dars-e-quran-weekly", date: "Every Friday", time: "6:00 PM - 8:00 PM", location: "Markaz Tanzeem, Lahore", description: "Weekly Quran study circle open to all." },
  { title: "Youth Leadership Training", slug: "youth-leadership-training-2026", date: "February 10-14, 2026", time: "9:00 AM - 4:00 PM", location: "Markaz Tanzeem, Lahore", description: "Five-day intensive training program for young leaders." },
  { title: "Webinar: Islamic Finance", slug: "webinar-islamic-finance", date: "January 25, 2026", time: "7:00 PM - 9:00 PM", location: "Online", description: "Online seminar on Islamic finance principles and contemporary applications." },
  { title: "Seminar: Palestine Solidarity", slug: "seminar-palestine-solidarity", date: "February 5, 2026", time: "3:00 PM - 7:00 PM", location: "Markaz Tanzeem, Lahore", description: "Seminar on the situation in Palestine and the Muslim response." },
  { title: "Quran Academy Graduation", slug: "quran-academy-graduation-2026", date: "March 30, 2026", time: "10:00 AM - 1:00 PM", location: "Markaz Tanzeem, Lahore", description: "Graduation ceremony for Quran Academy students." },
];

export default function UpcomingEventsPage() {
  return (
    <main className=" bg-background">
      <div className="container mx-auto py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Upcoming Events</h1>
        <p className="text-lg text-muted-foreground mb-8">Mark your calendar for Tanzeem-e-Islami&apos;s upcoming events.</p>
        <div className="max-w-4xl mx-auto space-y-6">
          {upcomingEvents.map((event, i) => (
            <a key={i} href={`/events/${event.slug}`} className="block bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                <span className="text-sm font-medium text-primary whitespace-nowrap">{event.date}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <span>🕐 {event.time}</span>
                <span>📍 {event.location}</span>
              </div>
              <p className="text-muted-foreground">{event.description}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
