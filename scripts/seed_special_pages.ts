import "dotenv/config";
import { db } from "../src/db";
import { pages, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedPages() {
  console.log("Seeding Special Pages...");

  const existingUsers = await db.select().from(users).limit(1);
  const authorId = existingUsers[0]?.id || "585fbfee-f92d-483c-b44a-b2c10641c174";

  const markazHTML = `
<div class="space-y-12 pb-12">
  <div class="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-12">
    <img src="https://www.tanzeem.org/wp-content/uploads/2023/11/markaz-1.jpg" alt="Markaz Tanzeem" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=2000'" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
      <div class="p-8 md:p-12">
        <span class="inline-block py-1.5 bg-primary text-[#fefefc] text-sm font-bold uppercase tracking-wider rounded-full mb-4">Headquarters</span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-[#fefefc] mb-4">Markaz Tanzeem-e-Islami</h1>
        <p class="text-white/90 text-lg md:text-xl max-w-2xl">The central hub of our movement, dedicated to the dissemination of Quranic knowledge and the establishment of Deen.</p>
      </div>
    </div>
  </div>

  <div class="grid md:grid-cols-2 gap-12 items-center">
    <div>
      <h2 class="text-3xl font-bold text-foreground mb-6">Central Operations & Academy</h2>
      <p class="text-lg text-foreground-muted leading-relaxed mb-6">
        Markaz Tanzeem-e-Islami serves as the nerve center for all organizational activities. Located in Lahore, Pakistan, it houses our central administration, publication division, and the primary Quran Academy.
      </p>
      <ul class="space-y-4">
        <li class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-foreground">Quran Academy</h3>
            <p class="text-foreground-muted mt-1">Hosting daily classes, extensive study circles, and specialized Dora-e-Tarjuma-e-Quran programs.</p>
          </div>
        </li>
        <li class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-foreground">Publications Division</h3>
            <p class="text-foreground-muted mt-1">The printing and distribution center for all books, tracts, and the monthly Meesaq magazine.</p>
          </div>
        </li>
        <li class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-foreground">Bait-ul-Maal</h3>
            <p class="text-foreground-muted mt-1">Central treasury managing organizational funds and charitable distributions securely.</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="bg-card border border-border rounded-3xl p-8 shadow-sm h-full flex flex-col justify-center">
      <h3 class="text-2xl font-bold text-foreground mb-6">Visit Markaz</h3>
      <div class="space-y-6">
        <div class="flex items-center gap-4 border-b border-border pb-6">
          <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <div>
            <p class="font-medium text-foreground">Address</p>
            <p class="text-foreground-muted text-sm">67-A, Johar Town, Lahore, Pakistan</p>
          </div>
        </div>
        <div class="flex items-center gap-4 border-b border-border pb-6">
          <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </div>
          <div>
            <p class="font-medium text-foreground">Phone Number</p>
            <p class="text-foreground-muted text-sm">+92 (42) 35869501-3</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p class="font-medium text-foreground">Email</p>
            <p class="text-foreground-muted text-sm">info@tanzeem.org</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `;

  const distanceHTML = `
<div class="space-y-12 pb-12">
  <div class="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl mb-12">
    <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000" alt="Distance Learning" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent flex items-end">
      <div class="p-8 md:p-12">
        <span class="inline-block py-1.5 bg-[#fefefc] text-primary text-sm font-bold uppercase tracking-wider rounded-full mb-4">E-Learning Portal</span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-[#fefefc] mb-4">Distance Learning Programs</h1>
        <p class="text-white/90 text-lg md:text-xl max-w-2xl">Access comprehensive Islamic education from the comfort of your home. Join our interactive online courses globally.</p>
      </div>
    </div>
  </div>

  <div class="text-center max-w-3xl mx-auto mb-16">
    <h2 class="text-3xl font-bold text-foreground mb-4">Current Online Offerings</h2>
    <p class="text-foreground-muted text-lg">Our dedicated e-learning platform provides structured semester-based courses equipped with live assessments, video lectures, and active digital mentorship.</p>
  </div>

  <div class="grid md:grid-cols-3 gap-8">
    
    <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
      <div class="h-48 bg-muted relative">
        <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Admissions Open</div>
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-foreground mb-2">Fahm-e-Quran Course</h3>
        <p class="text-foreground-muted text-sm mb-6 line-clamp-3">A complete syllabus covering the translation and profound exegesis of the Holy Quran tailored for working professionals and students.</p>
        <a href="https://elearning.tanzeem.org/" target="_blank" class="block w-full text-center py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-[#fefefc] transition-colors">
          Enroll via LMS
        </a>
      </div>
    </div>

    <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border-t-4 border-t-primary">
      <div class="h-48 bg-muted relative">
        <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-foreground mb-2">Arabic Grammar (Lughat-ul-Quran)</h3>
        <p class="text-foreground-muted text-sm mb-6 line-clamp-3">Master the fundamental language of the Quran. This comprehensive digital curriculum walks you through Arabic morphology and syntax.</p>
        <a href="https://elearning.tanzeem.org/" target="_blank" class="block w-full text-center py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-dark transition-colors">
          Join Next Batch
        </a>
      </div>
    </div>

    <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
      <div class="h-48 bg-muted relative">
        <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-foreground mb-2">Dora-e-Tarjuma Online</h3>
        <p class="text-foreground-muted text-sm mb-6 line-clamp-3">An intensive review course covering the entire translation of the Quran within specialized timeframes designed for rapid comprehension.</p>
        <a href="https://elearning.tanzeem.org/" target="_blank" class="block w-full text-center py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-[#fefefc] transition-colors">
          View Details
        </a>
      </div>
    </div>

  </div>

  <div class="mt-16 bg-primary/5 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between border border-primary/20 gap-8">
    <div>
      <h3 class="text-2xl font-bold text-foreground mb-2">Need Help Starting?</h3>
      <p class="text-foreground-muted max-w-xl">Our technical support team is available to assist you with LMS account creation, course enrollment logic, and technical troubleshooting.</p>
    </div>
    <a href="mailto:elearning@tanzeem.org" class="px-8 py-3 bg-primary text-[#fefefc] font-bold rounded-xl hover:shadow-lg transition-all shrink-0">
      Contact LMS Support
    </a>
  </div>

</div>
  `;

  // Upsert Markaz Tanzeem
  const existingMarkaz = await db.query.pages.findFirst({
    where: eq(pages.slug, "markaz-tanzeem")
  });
  if (existingMarkaz) {
    await db.update(pages).set({ content: markazHTML }).where(eq(pages.slug, "markaz-tanzeem"));
  } else {
    await db.insert(pages).values({
      id: "page-mkz-" + Date.now().toString(),
      title: "Markaz Tanzeem",
      slug: "markaz-tanzeem",
      excerpt: "The central hub of our movement.",
      content: markazHTML,
      isPublished: true,
      authorId,
      metaTitle: "Markaz Tanzeem - Headquarters | Tanzeem e Islami",
      metaDescription: "The central hub of our movement, dedicated to the dissemination of Quranic knowledge."
    });
  }

  // Upsert Distance Learning
  const existingDistance = await db.query.pages.findFirst({
    where: eq(pages.slug, "distance-learning")
  });
  if (existingDistance) {
    await db.update(pages).set({ content: distanceHTML }).where(eq(pages.slug, "distance-learning"));
  } else {
    await db.insert(pages).values({
      id: "page-dist-" + Date.now().toString(),
      title: "Distance Learning",
      slug: "distance-learning",
      excerpt: "Access comprehensive Islamic education from the comfort of your home.",
      content: distanceHTML,
      isPublished: true,
      authorId,
      metaTitle: "Distance Learning Programs | Tanzeem e Islami",
      metaDescription: "Access comprehensive Islamic education from the comfort of your home. Join our interactive online courses globally."
    });
  }

  console.log("Pages Injected successfully into DB.");
  process.exit(0);
}

seedPages().catch(console.error);
