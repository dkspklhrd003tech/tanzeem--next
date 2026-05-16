import { db } from '../src/db';
import { pages, pageSections } from '../src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const AUTHOR_ID = "585fbfee-f92d-483c-b44a-b2c10641c174";

async function seedEducation() {
    console.log("🌱 Seeding Education pages...");

    const eduPages = [
        {
            title: "Ruju Ilal Quran",
            slug: "education/ruju-ilal-quran",
            sections: [
                {
                    type: "hero",
                    config: {
                        title: "Ruju Ilal Quran",
                        subtitle: "A foundational course for understanding and implementing the Quran in daily life.",
                        backgroundImage: "https://images.unsplash.com/photo-1584281729295-c99063520108?auto=format&fit=crop&q=80&w=2000"
                    }
                },
                {
                    type: "intro",
                    config: {
                        heading: "Course Objectives",
                        body: "<p>The primary objective of the Ruju Ilal Quran course is to equip students with the necessary tools to study and understand the Quran directly.</p><ul><li>Learning Arabic language and grammar in a modern way.</li><li>Verbatim translation and grammatical analysis of the Quran.</li><li>Comprehensive study of selected Quranic syllabus.</li><li>Integration of Seerah, Hadith, and Islamic Economics.</li></ul>",
                        image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=80&w=2000",
                        alignment: "left"
                    }
                },
                {
                    type: "stats",
                    config: {
                        heading: "Course Impact",
                        stats: [
                            { label: "Duration", value: "10 Months" },
                            { label: "Students", value: "5000+" },
                            { label: "Centers", value: "20+" },
                            { label: "Language", value: "Urdu/Arabic" }
                        ]
                    }
                },
                {
                    type: "cta_banner",
                    config: {
                        heading: "Enroll Now",
                        subheading: "Start your journey towards understanding the Word of Allah.",
                        buttonLabel: "Visit RIQC.PK",
                        buttonUrl: "https://riqc.pk",
                        backgroundColor: "#0D5844"
                    }
                }
            ]
        },
        {
            title: "Distance Learning",
            slug: "education/distance-learning",
            sections: [
                {
                    type: "intro",
                    config: {
                        heading: "Learn Islam from Anywhere",
                        subheading: "Flexible learning programs for global students.",
                        body: "<p>Tanzeem-e-Islami offers various distance learning programs designed for individuals who cannot attend physical classes. Our flagship course, 'Qur'an Hakeem Ki Fikri-o-Amali Rehnumai', is available online.</p><p>Students receive audio lectures, reading materials, and assessment tools to progress through the curriculum at their own pace.</p>",
                        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=2000",
                        alignment: "right"
                    }
                },
                {
                    type: "accordion",
                    config: {
                        heading: "Program Details",
                        items: [
                            {
                                question: "What courses are available?",
                                answer: "The 'Qur'an Hakeem Ki Fikri-o-Amali Rehnumai' course is the primary offering, consisting of 44 audio lectures by Dr. Israr Ahmed."
                            },
                            {
                                question: "How to register?",
                                answer: "You can register through the online portal by filling out the application form and paying the nominal fee."
                            },
                            {
                                question: "Is there any certification?",
                                answer: "Yes, students who successfully complete the course and assessments are awarded certificates."
                            }
                        ]
                    }
                }
            ]
        }
    ];

    for (const pageData of eduPages) {
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

    console.log("✅ Education pages seeded successfully!");
}

seedEducation().catch(console.error);
