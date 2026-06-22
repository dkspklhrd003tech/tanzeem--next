export const metadata = { title: "Books by Author | Tanzeem-e-Islami" };

const authors = [
  { name: "Dr. Israr Ahmed", slug: "dr-israr-ahmed", books: "50+", description: "Founder of Tanzeem-e-Islami, renowned Islamic scholar and thinker" },
  { name: "Shujauddin Sheikh", slug: "shujauddin-sheikh", books: "15+", description: "Current Ameer of Tanzeem-e-Islami" },
  { name: "Allama Iqbal", slug: "allama-iqbal", books: "10+", description: "Philosopher, poet, and visionary of Pakistan" },
  { name: "Maulana Maududi", slug: "maulana-maududi", books: "30+", description: "Founder of Jamaat-e-Islami, prolific Islamic writer" },
  { name: "Various Authors", slug: "various", books: "100+", description: "Collection of works by various scholars and writers" },
];

export default function BooksByAuthorPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Books by Author</h1>
        <p className="text-lg text-muted-foreground mb-8">Browse books organized by author for easy discovery.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {authors.map((author) => (
            <a
              key={author.slug}
              href={`/resources/books/by-author/${author.slug}`}
              className="group bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {author.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{author.description}</p>
              <span className="text-xs text-primary font-medium">{author.books} books</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
