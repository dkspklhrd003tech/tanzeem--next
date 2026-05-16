import { db } from '../src/db';
import { pages, pageSections } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const AUTHOR_ID = "585fbfee-f92d-483c-b44a-b2c10641c174";

async function seedResources() {
    console.log("🌱 Seeding Resources pages...");

    const resPages = [
        {
            title: "Audio Library",
            slug: "resources/audios",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Audio Library",
                        subtitle: "Listen to the complete collection of lectures and series by Dr. Israr Ahmed.",
                        backgroundImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "media_grid",
                    config: {
                        heading: "Featured Audio Series",
                        columns: 3,
                        items: [
                            {
                                title: "Bayan-ul-Quran (Complete)",
                                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
                                type: "audio",
                                link: "/resources/audios/bayan-ul-quran"
                            },
                            {
                                title: "Muntakhab Nisab",
                                image: "https://images.unsplash.com/photo-1491309055443-305602493950?auto=format&fit=crop&q=80&w=400",
                                type: "audio",
                                link: "/resources/audios/muntakhab-nisab"
                            },
                            {
                                title: "Khutbat-e-Jummah",
                                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
                                type: "audio",
                                link: "/resources/audios/khutbat-e-jummah"
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Video Library",
            slug: "resources/videos",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Video Library",
                        subtitle: "Watch impactful lectures and series on Quranic wisdom and Islamic revival.",
                        backgroundImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "media_grid",
                    config: {
                        heading: "Latest Broadcasts",
                        columns: 3,
                        items: [
                            {
                                title: "Zamana Gawah Hai - Episode 112",
                                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
                                type: "video",
                                link: "https://youtube.com"
                            },
                            {
                                title: "Ameer Say Mulaqat - Session #50",
                                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400",
                                type: "video",
                                link: "https://youtube.com"
                            },
                            {
                                title: "The Purpose of Life",
                                image: "https://images.unsplash.com/photo-1532012197367-2d5978d30793?auto=format&fit=crop&q=80&w=400",
                                type: "video",
                                link: "https://youtube.com"
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Books & Publications",
            slug: "resources/books",
            sections: [
                {
                    type: "publications",
                    config: {
                        heading: "Featured Books",
                        publications: [
                            {
                                title: "Self Purification (Tazkiya)",
                                cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
                                author: "Dr. Israr Ahmed",
                                link: "/resources/books/tazkiya"
                            },
                            {
                                title: "The Call of the Quran",
                                cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
                                author: "Dr. Israr Ahmed",
                                link: "/resources/books/call-of-quran"
                            },
                            {
                                title: "Islamic Renaissance",
                                cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400",
                                author: "Dr. Israr Ahmed",
                                link: "/resources/books/renaissance"
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Frequently Asked Questions",
            slug: "faq",
            sections: [
                {
                    type: "accordion",
                    config: {
                        heading: "General Questions",
                        items: [
                            {
                                question: "What is the mission of Tanzeem-e-Islami?",
                                answer: "The stated mission of Tanzeem-e-Islami is to establish an Islamic Welfare State based on a just political, social, and economic order, modeled after the system established by Prophet Muhammad (SAW)."
                            },
                            {
                                question: "Is Tanzeem-e-Islami a political party?",
                                answer: "The organization states that it is neither a political party nor a religious sect. Instead, they describe themselves as an 'Islamic Revolutionary Party' dedicated to the revival of Islam."
                            },
                            {
                                question: "What is the methodology for achieving their goals?",
                                answer: "Tanzeem-e-Islami emphasizes a non-violent, peaceful process including Da'wah, Organization, and Passive Resistance."
                            }
                        ]
                    }
                }
            ]
        }
    ];

    for (const pageData of resPages) {
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

    console.log("✅ Resources pages seeded successfully!");
}

seedResources().catch(console.error);
