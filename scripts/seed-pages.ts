import { db } from "../src/lib/db";
import { pages, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

const SEED_PAGES = [
    {
        title: "About Us",
        slug: "about-us",
        content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">Tanzeem-e-Islami is an Islamic organization that was founded by Dr. Israr Ahmed in 1975. Our ultimate goal is the establishment of the Islamic system of life and the re-establishment of Khilafah in the modern world.</p>
        <p class="text-lg leading-relaxed text-[#222222]">The foundational principles of Tanzeem-e-Islami are based upon the Quran and Sunnah, and it strictly adheres to the methodology prescribed by Prophet Muhammad (PBUH) for Islamic revolution.</p>
        <h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">Our History</h2>
        <p class="text-lg leading-relaxed text-[#222222]">After evaluating the condition of Muslims and various religious organizations, Dr. Israr Ahmed concluded that a distinctly specialized party must be formed to strive for the Iqamat-e-Deen (establishment of religion) comprehensively.</p>
      </div>
    `,
        excerpt: "Learn about the background and history of Tanzeem-e-Islami, founded by Dr. Israr Ahmed.",
    },
    {
        title: "Our Mission",
        slug: "our-mission",
        content: `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">The Mission Statement</h2>
        <p class="text-lg leading-relaxed text-[#222222]">Our mission is to establish the Deen of Allah in its entirety, at all levels of human existence - individual as well as collective, societal as well as state.</p>
        <p class="text-lg leading-relaxed text-[#222222]">We believe that the struggle to establish the Islamic system of social justice is the ultimate obligation of every Muslim in the present era, and this struggle must be carried out in an organized manner through a disciplined jamaat (party).</p>
        <ul class="list-disc pl-6 space-y-2 text-lg text-foreground-muted mt-4">
            <li>To call people towards the deeply rooted understanding of the Quran.</li>
            <li>To reform the lives of individuals to conform with the Sunnah.</li>
            <li>To form a disciplined organization of committed individuals.</li>
            <li>To struggle for the establishment of Khilafah.</li>
        </ul>
      </div>
    `,
        excerpt: "The mission of Tanzeem-e-Islami is to work for the establishment of the Islamic system of life.",
    },
    {
        title: "Contact Us",
        slug: "contact",
        content: `
      <div class="space-y-6">
        <p class="text-lg leading-relaxed text-[#222222]">We welcome your inquiries, feedback, and questions. Please reach out to our central office using the information below.</p>
        
        <div class="grid md:grid-cols-2 gap-8 mt-8">
            <div class="bg-muted/50 p-6 rounded-xl">
                <h3 class="font-bold text-xl mb-3 text-foreground">Head Office</h3>
                <p class="text-foreground-muted mb-2"><strong>Address:</strong> 36-K, Model Town, Lahore, Pakistan</p>
                <p class="text-foreground-muted mb-2"><strong>Phone:</strong> +92 42 3586 9501</p>
                <p class="text-foreground-muted mb-2"><strong>Email:</strong> markaz@tanzeem.org</p>
            </div>
            <div class="bg-muted/50 p-6 rounded-xl">
                <h3 class="font-bold text-xl mb-3 text-foreground">Regional Offices</h3>
                <p class="text-foreground-muted mb-2">Offices are present in major cities across Pakistan including Karachi, Islamabad, Peshawar, and Quetta. Please contact the Head Office for local representatives.</p>
            </div>
        </div>
      </div>
    `,
        excerpt: "Get in touch with the central office of Tanzeem-e-Islami.",
    },
    {
        title: "Frequently Asked Questions",
        slug: "faqs",
        content: `
      <div class="space-y-8">
        <div>
            <h3 class="text-xl font-bold text-foreground mb-2">How can I join Tanzeem-e-Islami?</h3>
            <p class="text-lg text-foreground-muted">You can join by formally accepting the terms of membership (Rafaqaat) and pledging your commitment to the Ameer. Please visit the Join section or contact your local chapter for details.</p>
        </div>
        <div>
            <h3 class="text-xl font-bold text-foreground mb-2">What is the methodology of Tanzeem?</h3>
            <p class="text-lg text-foreground-muted">Our methodology is based exclusively on the Seerah of Prophet Muhammad (SAWS), involving calling people to the Quran, building a disciplined cadre, and executing a peaceful, non-violent mass movement.</p>
        </div>
        <div>
            <h3 class="text-xl font-bold text-foreground mb-2">Where can I find books by Dr. Israr Ahmed?</h3>
            <p class="text-lg text-foreground-muted">All books, audio lectures, and videos are available for free in the Resources section of our website, as well as on prominent YouTube channels.</p>
        </div>
      </div>
    `,
        excerpt: "Answers to common questions about Tanzeem-e-Islami's methodology, membership, and resources.",
    }
];

async function main() {
    console.log("Looking up admin user...");
    const admin = await db.query.users.findFirst({
        where: eq(users.email, "admin@tanzeem.org")
    });

    if (!admin) {
        console.error("Admin user not found. Please ensure the admin user exists.");
        process.exit(1);
    }

    console.log("Clearing existing pages...");
    await db.delete(pages);

    console.log("Seeding realistic pages...");

    for (const page of SEED_PAGES) {
        await db.insert(pages).values({
            id: crypto.randomUUID(),
            title: page.title,
            slug: page.slug,
            content: page.content,
            excerpt: page.excerpt,
            authorId: admin.id,
            isPublished: true,
            showInMenu: true,
        });
        console.log(`- Created: ${page.title} (/${page.slug})`);
    }

    console.log("Pages completely seeded successfully.");
}

main().catch(console.error).then(() => process.exit(0));
