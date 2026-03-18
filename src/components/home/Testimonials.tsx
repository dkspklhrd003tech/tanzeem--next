"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export function Testimonials({
  booksData = [],
  magazinesData = []
}: {
  booksData?: any[],
  magazinesData?: any[]
}) {
  // Fallbacks if db is empty so it still looks good
  const fallbackMagazines = [
    { title: "Hikmat-e-Quran", subtitle: "Monthly", coverUrl: "/media/mag-hikmat.jpg", href: "/resources/magazines" },
    { title: "Meesaq", subtitle: "Quarterly", coverUrl: "/media/mag-meesaq.jpg", href: "/resources/magazines" },
    { title: "Nida-e-Khilafat", subtitle: "Monthly", coverUrl: "/media/mag-nida.jpg", href: "/resources/magazines" },
    { title: "Shabab Magazine", subtitle: "Youth", coverUrl: "/media/mag-shabab.jpg", href: "/resources/magazines" },
  ];

  const fallbackBooks = [
    { title: "Bayan-ul-Quran", author: "Dr. Israr Ahmed", coverUrl: "/media/book-bayan.jpg", category: "Quran Studies" },
    { title: "Minhaj-ul-Inqilab", author: "Dr. Israr Ahmed", coverUrl: "/media/book-minhaj.jpg", category: "Deen-e-Islam" },
    { title: "Musalmano Par Quran Ke Haqooq", author: "Dr. Israr Ahmed", coverUrl: "/media/book-haqooq.jpg", category: "Sunnat o Seerat" },
    { title: "Asaan Arbi Grammar", author: "Lutf-ur-Rehman", coverUrl: "/media/book-arbi.jpg", category: "Arbi Grammar" },
  ];

  const displayMagazines = magazinesData.length >= 4 ? magazinesData.slice(0, 4) : fallbackMagazines;
  const displayBooks = booksData.length >= 4 ? booksData.slice(0, 4) : fallbackBooks;

  return (
    <>
      {/* Our Magazines */}
      <section className="py-14 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-primary text-sm font-semibold tracking-wider uppercase mb-1">— Our Magazines</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Publications
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/resources/magazines" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayMagazines.map((mag, i) => (
              <motion.div
                key={mag.title || mag.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={mag.href || `/resources/magazines/${mag.id}`} className="group block h-full">
                  <div className="bg-background-secondary rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col border border-border">
                    {/* Magazine Cover (13:18 Aspect Ratio) */}
                    <div className="relative w-full aspect-[13/18] bg-muted flex items-center justify-center overflow-hidden">
                      {mag.coverUrl ? (
                        <img src={mag.coverUrl} alt={mag.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base md:text-lg leading-tight">{mag.title}</h3>
                        <p className="text-primary text-xs font-semibold mt-1 uppercase tracking-wider">{mag.subtitle || "Issue"}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Books */}
      <section className="py-14 bg-background-secondary pattern-bg">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-primary text-sm font-semibold tracking-wider uppercase mb-1">— Our Books</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Literature & Publications
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/resources/books" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                View Library <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayBooks.map((book, i) => (
              <motion.div
                key={book.title || book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group cursor-pointer h-full"
              >
                <div className="bg-[#fefefc] rounded-xl overflow-hidden hover:shadow-xl transition-all shadow-sm h-full flex flex-col border border-border/50">
                  {/* Book Cover (13:18 Aspect Ratio) */}
                  <div className="relative w-full aspect-[13/18] bg-muted/30 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 z-0" />
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-[85%] h-auto max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500 z-10"
                      />
                    ) : (
                      <div className="w-[85%] h-[90%] bg-primary/10 rounded border-l-4 border-primary flex items-center justify-center z-10 shadow-md">
                        <span className="text-primary/40 font-bold text-xl px-2 text-center">{book.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-primary font-semibold mb-1 uppercase tracking-wider">{book.category || "General"}</p>
                    <h3 className="font-bold text-foreground text-base leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-foreground-muted text-sm line-clamp-1 mt-auto">{book.author || "Dr. Israr Ahmed"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
