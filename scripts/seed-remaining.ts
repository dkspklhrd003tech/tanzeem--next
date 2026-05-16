import { db } from '../src/db';
import { pages, pageSections } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const AUTHOR_ID = "585fbfee-f92d-483c-b44a-b2c10641c174";

async function seedRemaining() {
    console.log("🌱 Seeding Remaining pages...");

    const remainingPages = [
        {
            title: "Introduction",
            slug: "organization/introduction",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "Introduction to Tanzeem-e-Islami",
                        body: "<p>Tanzeem-e-Islami is a global Islamic movement founded in 1975 by Dr. Israr Ahmed. We advocate for the implementation of the Quran and Sunnah in all spheres of life.</p><p>Our goal is the establishment of the Islamic system (Khilafah) through a peaceful, non-violent mass movement.</p>",
                        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=2000",
                        alignment: "left"
                    }
                }
            ]
        },
        {
            title: "The Founder",
            slug: "organization/founder",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "Dr. Israr Ahmed",
                        subheading: "Founder & Visionary",
                        body: "<p>Dr. Israr Ahmed (1932–2010) was a prominent Islamic scholar who dedicated his life to Quranic wisdom. He resigned from Jamaat-e-Islami to form Tanzeem-e-Islami, focusing on the revolutionary message of the Quran.</p>",
                        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
                        alignment: "left"
                    }
                }
            ]
        },
        {
            title: "The Ameer",
            slug: "organization/ameer",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "Mohtaram Shujauddin Shaikh",
                        subheading: "Current Ameer",
                        body: "<p>Mohtaram Shujauddin Shaikh is the current leader of Tanzeem-e-Islami, providing guidance and direction to the movement's global mission.</p>",
                        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
                        alignment: "right"
                    }
                }
            ]
        },
        {
            title: "Press Releases",
            slug: "resources/press",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Press Releases",
                        subtitle: "Official statements and commentary on national and global affairs.",
                        backgroundImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "media_grid",
                    config: {
                        heading: "Recent Statements",
                        columns: 3,
                        items: [
                            {
                                title: "Statement on Global Peace",
                                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
                                type: "video",
                                link: "/resources/press/statement-1"
                            },
                            {
                                title: "Commentary on Economic Justice",
                                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400",
                                type: "video",
                                link: "/resources/press/statement-2"
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Magazines",
            slug: "resources/magazines",
            sections: [
                {
                    type: "publications",
                    config: {
                        heading: "Our Periodicals",
                        publications: [
                            {
                                title: "Meesaq",
                                cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
                                link: "/resources/magazines/meesaq"
                            },
                            {
                                title: "Hikmat-e-Quran",
                                cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
                                link: "/resources/magazines/hikmat"
                            },
                            {
                                title: "Nida-e-Khilafat",
                                cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400",
                                link: "/resources/magazines/nida"
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Quranic Circles",
            slug: "quranic-circles",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Quranic Circles",
                        subtitle: "Join a local Halaqa to deepen your understanding of the Quran.",
                        backgroundImage: "https://images.unsplash.com/photo-1584281729295-c99063520108?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "intro",
                    config: {
                        heading: "Collective Learning",
                        body: "<p>The core of our organization is the Quranic Circle (Halaqa). These circles provide a structured environment for collective study, mutual support, and spiritual growth.</p>",
                        image: "https://images.unsplash.com/photo-1523240715639-99a8088fc3a2?auto=format&fit=crop&q=80&w=2000",
                        alignment: "left"
                    }
                }
            ]
        }
    ];

    for (const pageData of remainingPages) {
        const existingPages = await db.select().from(pages).where(eq(pages.slug, pageData.slug));
        let pageId: string;
        
        if (existingPages.length > 0) {
            console.log(`Updating existing page: ${pageData.slug}`);
            pageId = existingPages[0].id;
            await db.update(pages).set({
                title: pageData.title,
                authorId: AUTHOR_ID,
                updatedAt: new Date(),
            }).where(eq(pages.id, pageId));
            await db.delete(pageSections).where(eq(pageSections.pageId, pageId));
        } else {
            console.log(`Creating new page: ${pageData.slug}`);
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

    console.log("✅ Remaining pages seeded successfully!");
}

seedRemaining().catch(console.error);
