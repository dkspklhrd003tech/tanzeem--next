export const metadata = { title: "Books by Category | Tanzeem-e-Islami" };

const categories = [
  { title: "Tafseer & Quranic Studies", href: "/resources/books/by-category/tafseer", description: "Books on Quranic commentary and sciences" },
  { title: "Hadith & Sunnah", href: "/resources/books/by-category/hadith", description: "Collections and explanations of Hadith" },
  { title: "Islamic Theology (Aqeedah)", href: "/resources/books/by-category/aqeedah", description: "Books on Islamic beliefs and creed" },
  { title: "Seerah & Islamic History", href: "/resources/books/by-category/seerah", description: "Biography of Prophet (SAW) and Islamic history" },
  { title: "Contemporary Issues", href: "/resources/books/by-category/contemporary", description: "Islamic perspectives on modern challenges" },
  { title: "Spirituality & Tazkiyah", href: "/resources/books/by-category/spirituality", description: "Books on spiritual purification" },
  { title: "Fiqh & Islamic Law", href: "/resources/books/by-category/fiqh", description: "Islamic jurisprudence" },
  { title: "Children's Literature", href: "/resources/books/by-category/children", description: "Islamic books for young readers" },
];

export default function BooksByCategoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 md:py-16 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Books by Category</h1>
        <p className="text-lg text-muted-foreground mb-8">Explore books organized by subject area for easy discovery.</p>
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
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
