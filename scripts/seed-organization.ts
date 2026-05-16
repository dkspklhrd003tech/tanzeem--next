import { db } from '../src/db';
import { pages, pageSections } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const AUTHOR_ID = "585fbfee-f92d-483c-b44a-b2c10641c174";

async function seedOrganization() {
    console.log("🌱 Seeding Organization pages...");

    const orgPages = [
        {
            title: "Organization Overview",
            slug: "organization",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "About Tanzeem-e-Islami",
                        subheading: "Striving for the Islamic System",
                        body: "It is not enough to practice Islam in one's individual life but that the teachings of the Qur'an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life. The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal.",
                        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=2000",
                        imageAlt: "Islamic Heritage",
                        alignment: "left"
                    }
                },
                {
                    type: "cta_banner",
                    config: {
                        heading: "Our Mission Statement",
                        subheading: "Establish an Islamic State based on socio-political-economic Principles of Islam on the lines of the one established by Prophet Muhammad (PBUH)",
                        buttonLabel: "Read More",
                        buttonUrl: "/organization/mission-statement",
                        backgroundColor: "#0D5844"
                    }
                },
                {
                    type: "accordion",
                    config: {
                        heading: "Our Ideology",
                        items: [
                            {
                                question: "Basic Belief",
                                answer: "The core tenets of faith that form the bedrock of our understanding and practice. We believe in the absolute sovereignty of Allah (SWT) and the finality of Prophet Muhammad (SAW)."
                            },
                            {
                                question: "Our Obligations",
                                answer: "The duties incumbent upon us as believers in establishing the Deen. This includes the individual practice of Islam and the collective struggle for its implementation."
                            },
                            {
                                question: "Methodology",
                                answer: "The prophetic approach to societal change and organizational structuring. We follow the Sunnah of the Prophet (SAW) in inviting people to Islam and building a disciplined organization."
                            },
                            {
                                question: "Foundation",
                                answer: "The historical and ideological roots that establish our current framework, drawing inspiration from the works of Allama Iqbal and the early years of Pakistan."
                            }
                        ]
                    }
                },
                {
                    type: "team",
                    config: {
                        heading: "Leadership",
                        members: [
                            {
                                name: "Dr. Israr Ahmed",
                                designation: "Founder",
                                bio: "Dr. Israr Ahmed (1932-2010) dedicated his life to the propagation of Quranic teachings and the revival of the dynamic concept of Islam.",
                                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
                            },
                            {
                                name: "Mohtaram Shujauddin Shaikh",
                                designation: "Ameer",
                                bio: "Mohtaram Shujauddin Shaikh is the current Ameer of Tanzeem-e-Islami, continuing the mission of establishing the Islamic system.",
                                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: "Mission Statement",
            slug: "organization/mission-statement",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "Our Mission Statement",
                        body: "<p>The ultimate goal of Tanzeem-e-Islami is to seek the pleasure of Allah (SWT) by striving for the establishment of the Islamic System (Deen) in its totality.</p><p>We aim to establish an Islamic State based on socio-political-economic principles of Islam on the lines of the one established by Prophet Muhammad (SAW).</p>",
                        image: "https://images.unsplash.com/photo-1518005020250-6eb5f38075cc?auto=format&fit=crop&q=80&w=2000",
                        alignment: "right"
                    }
                }
            ]
        },
        {
            title: "Our Ideology",
            slug: "organization/our-ideology",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Our Ideology",
                        subtitle: "The foundational principles that guide our organizational structure and methodology.",
                        backgroundImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "accordion",
                    config: {
                        items: [
                            {
                                question: "Basic Belief",
                                answer: "The core tenets of faith that form the bedrock of our understanding and practice."
                            },
                            {
                                question: "Our Obligations",
                                answer: "The duties incumbent upon us as believers in establishing the Deen."
                            },
                            {
                                question: "Methodology",
                                answer: "The prophetic approach to societal change and organizational structuring."
                            },
                            {
                                question: "Foundation",
                                answer: "The historical and ideological roots that establish our current framework."
                            }
                        ]
                    }
                }
            ]
        }
    ];

    for (const pageData of orgPages) {
        // Check if page already exists
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
            
            // Delete existing sections to re-seed
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

        // Insert sections
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

    console.log("✅ Organization pages seeded successfully!");
}

seedOrganization().catch(console.error);
