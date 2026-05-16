import { db } from '../src/db';
import { pages, pageSections } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const AUTHOR_ID = "585fbfee-f92d-483c-b44a-b2c10641c174";

async function seedFooter() {
    console.log("🌱 Seeding Footer pages...");

    const footerPages = [
        {
            title: "Join Tanzeem",
            slug: "join",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Join the Mission",
                        subtitle: "Become a part of a global community dedicated to establishing Deen.",
                        backgroundImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "intro",
                    config: {
                        heading: "Why Join Tanzeem-e-Islami?",
                        body: "<p>Joining Tanzeem-e-Islami is not just about membership; it's about entering a disciplined struggle (Jihad) for the establishment of Deen.</p><p>We expect our members to commit to Bai'yah (Pledge), maintain personal discipline, participate actively in study circles, and contribute financially to the mission.</p>",
                        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2000",
                        alignment: "left"
                    }
                }
            ]
        },
        {
            title: "Contact Us",
            slug: "contact-us",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Contact Us",
                        subtitle: "We'd love to hear from you. Reach out through any of our channels.",
                        backgroundImage: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2000"
                    }
                }
                // ContactSection is already part of the layout or can be added manually
            ]
        },
        {
            title: "Our History",
            slug: "organization/history",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "Legacy of Revival",
                        subheading: "Tracing our roots back to the vision of Dr. Israr Ahmed.",
                        body: "<p>Tanzeem-e-Islami was established in 1975 by Dr. Israr Ahmed (RA) with the goal of reviving the dynamic concept of Islam as a collective system.</p><p>Over the decades, we have grown into a global organization with centers and members across the world, all striving for the same noble cause.</p>",
                        image: "https://images.unsplash.com/photo-1464695110811-dcf3903dc2f4?auto=format&fit=crop&q=80&w=2000",
                        alignment: "right"
                    }
                }
            ]
        }
    ];

    for (const pageData of footerPages) {
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

    console.log("✅ Footer pages seeded successfully!");
}

seedFooter().catch(console.error);
