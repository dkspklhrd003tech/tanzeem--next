import { db } from '../src/db';
import { pages, pageSections } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const AUTHOR_ID = "585fbfee-f92d-483c-b44a-b2c10641c174";

async function seedAllFinal() {
    console.log("🌱 Starting final comprehensive seed...");

    const allPages = [
        // Organization
        {
            title: "Organization",
            slug: "organization",
            sections: [
                { type: "hero", config: { title: "Tanzeem-e-Islami", subtitle: "Striving for the revival of Islam and the establishment of Khilafah.", backgroundImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=2000" } },
                { type: "intro", config: { heading: "About Us", body: "Tanzeem-e-Islami was established in 1975 by Dr. Israr Ahmed. We believe that practicing Islam in individual life is not enough; the teachings of the Quran and Sunnah must be implemented in social, cultural, political, and economic spheres.", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=2000", alignment: "left" } },
                { type: "cta_banner", config: { heading: "Our Mission Statement", subheading: "Establish an Islamic State based on socio-political-economic Principles of Islam.", buttonLabel: "Read More", buttonUrl: "/organization/mission-statement" } },
                { type: "team", config: { heading: "Our Leadership", members: [{ name: "Dr. Israr Ahmed", designation: "Founder", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" }, { name: "Mohtaram Shujauddin Shaikh", designation: "Ameer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }] } }
            ]
        },
        { title: "Background", slug: "organization/background", sections: [{ type: "intro", config: { heading: "Our Background", body: "The roots of Tanzeem-e-Islami lie in the vision of Allama Iqbal and the early struggle for Pakistan. Dr. Israr Ahmed founded the organization to continue the revolutionary mission of the Quran.", image: "https://images.unsplash.com/photo-1464695110811-dcf3903dc2f4?auto=format&fit=crop&q=80&w=2000" } }] },
        { title: "Mission Statement", slug: "organization/mission-statement", sections: [{ type: "intro", config: { heading: "Mission Statement", body: "Establish an Islamic State based on socio-political-economic Principles of Islam on the lines of the one established by Prophet Muhammad (PBUH).", alignment: "right" } }] },
        { title: "Our Ideology", slug: "organization/our-ideology", sections: [{ type: "accordion", config: { heading: "The Four Pillars", items: [{ question: "Basic Belief", answer: "Absolute sovereignty of Allah and finality of Prophethood." }, { question: "Our Obligations", answer: "Individual practice and collective struggle." }, { question: "Methodology", answer: "Prophetic approach to societal change." }, { question: "Foundation", answer: "Historical roots of the movement." }] } }] },
        { title: "The Founder", slug: "organization/the-founder", sections: [{ type: "intro", config: { heading: "Dr. Israr Ahmed (RA)", subheading: "Founder of Tanzeem-e-Islami", body: "Renowned Islamic scholar whose life was dedicated to the propagation of the Quranic message. He authored dozens of books and delivered thousands of lectures.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" } }] },
        { title: "The Ameer", slug: "organization/the-ameer", sections: [{ type: "intro", config: { heading: "Mohtaram Shujauddin Shaikh", subheading: "Current Ameer", body: "Leading the movement with wisdom and dedication to the mission of establishing Deen.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400", alignment: "right" } }] },

        // Education
        { title: "Ruju Ilal Quran", slug: "markaz-tanzeem", sections: [{ type: "hero", config: { title: "Ruju Ilal Quran", subtitle: "Reverting to the Quran for guidance and success.", backgroundImage: "https://images.unsplash.com/photo-1584281729295-c99063520108?auto=format&fit=crop&q=80&w=2000" } }, { type: "intro", config: { heading: "About the Course", body: "A comprehensive course designed to help students understand the Quran directly through Arabic grammar and exegesis.", image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=2000" } }] },
        { title: "Distance Learning", slug: "distance-learning", sections: [{ type: "intro", config: { heading: "Distance Learning Programs", body: "Study Islam from anywhere in the world. Our online courses provide flexibility and structured learning.", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=2000", alignment: "right" } }] },

        // Resources
        { title: "Audio Library", slug: "audio-2", sections: [{ type: "media_grid", config: { heading: "Audio Archives", items: [{ title: "Bayan-ul-Quran", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400", type: "audio", link: "#" }, { title: "Khutbat-e-Jummah", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400", type: "audio", link: "#" }] } }] },
        { title: "Video Library", slug: "videos", sections: [{ type: "media_grid", config: { heading: "Latest Videos", items: [{ title: "Zamana Gawah Hai", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400", type: "video", link: "#" }, { title: "Ameer Say Mulaqat", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400", type: "video", link: "#" }] } }] },
        { title: "Books", slug: "books", sections: [{ type: "publications", config: { heading: "Tanzeem Publications", publications: [{ title: "Self Purification", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400", author: "Dr. Israr Ahmed", link: "#" }] } }] },
        { title: "Magazines", slug: "magazines", sections: [{ type: "publications", config: { heading: "Our Periodicals", publications: [{ title: "Meesaq", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400", link: "#" }, { title: "Hikmat-e-Quran", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400", link: "#" }] } }] },
        { title: "Press Releases", slug: "press-releases", sections: [{ type: "intro", config: { heading: "Press & News", body: "Official statements on national and international issues." } }] },
        { title: "FAQs", slug: "faq", sections: [{ type: "accordion", config: { heading: "General FAQs", items: [{ question: "What is Tanzeem-e-Islami?", answer: "An Islamic movement founded by Dr. Israr Ahmed." }, { question: "How to join?", answer: "By taking the pledge of allegiance (Bai'yah)." }] } }] },

        // Footer / Misc
        { title: "Join Tanzeem", slug: "join", sections: [{ type: "intro", config: { heading: "Join the Cause", body: "Commit your life to the service of Deen.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2000" } }] },
        { title: "Contact Us", slug: "contact-us", sections: [{ type: "hero", config: { title: "Contact Us", subtitle: "We'd love to hear from you.", backgroundImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2000" } }] },
        { title: "Quranic Circles", slug: "quranic-circles", sections: [{ type: "intro", config: { heading: "Halaqaat", body: "Local study circles for collective learning." } }] },
        { title: "History", slug: "organization/history", sections: [{ type: "intro", config: { heading: "Our History", body: "A legacy of struggle since 1975." } }] },
        { title: "Introduction", slug: "organization/introduction", sections: [{ type: "intro", config: { heading: "Introduction", body: "Overview of our mission and vision." } }] }
    ];

    for (const pageData of allPages) {
        const existingPages = await db.select().from(pages).where(eq(pages.slug, pageData.slug));
        let pageId: string;

        if (existingPages.length > 0) {
            console.log(`Updating: ${pageData.slug}`);
            pageId = existingPages[0].id;
            await db.update(pages).set({
                title: pageData.title,
                authorId: AUTHOR_ID,
                updatedAt: new Date(),
            }).where(eq(pages.id, pageId));
            await db.delete(pageSections).where(eq(pageSections.pageId, pageId));
        } else {
            console.log(`Creating: ${pageData.slug}`);
            pageId = uuidv4();
            await db.insert(pages).values({
                id: pageId,
                title: pageData.title,
                slug: pageData.slug,
                authorId: AUTHOR_ID,
                isPublished: true,
                content: "",
            });
        }

        for (let i = 0; i < pageData.sections.length; i++) {
            const section = pageData.sections[i];
            await db.insert(pageSections).values({
                id: uuidv4(),
                pageId: pageId,
                type: section.type,
                order: i,
                config: section.config,
                isActive: true,
            });
        }
    }

    console.log("✅ All pages seeded successfully!");
}

seedAllFinal().catch(console.error);
