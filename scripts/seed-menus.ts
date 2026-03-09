import { db } from "../src/lib/db";
import { menuItems } from "../src/db/schema";
import { eq } from "drizzle-orm";

const menuData = [
    {
        "label": "Home",
        "url": "https://www.tanzeem.org/",
        "children": []
    },
    {
        "label": "Organization",
        "url": "https://www.tanzeem.org/organization/",
        "children": [
            {
                "label": "Background",
                "url": "https://www.tanzeem.org/organization/background-2/",
                "children": []
            },
            {
                "label": "Mission Statement",
                "url": "https://www.tanzeem.org/organization/mission-statement/",
                "children": []
            },
            {
                "label": "Our Ideology",
                "url": "https://www.tanzeem.org/organization/our-ideology/",
                "children": [
                    {
                        "label": "Basic Belief",
                        "url": "https://www.tanzeem.org/organization/our-ideology/basic-belief/",
                        "children": []
                    },
                    {
                        "label": "Our Obligations",
                        "url": "https://www.tanzeem.org/organization/our-ideology/our-obligations/",
                        "children": []
                    },
                    {
                        "label": "Our Methodology",
                        "url": "https://www.tanzeem.org/organization/our-ideology/methodology/",
                        "children": []
                    },
                    {
                        "label": "Foundation",
                        "url": "https://www.tanzeem.org/organization/our-ideology/foundation/",
                        "children": []
                    }
                ]
            },
            {
                "label": "The Founder",
                "url": "https://www.tanzeem.org/organization/the-founder/",
                "children": []
            },
            {
                "label": "The Ameer",
                "url": "https://www.tanzeem.org/organization/the-ameer/",
                "children": []
            }
        ]
    },
    {
        "label": "Education",
        "url": "https://www.tanzeem.org/#",
        "children": [
            {
                "label": "Ruju Ilal Quran",
                "url": "https://www.tanzeem.org/markaz-tanzeem/",
                "children": []
            },
            {
                "label": "Distance Learning",
                "url": "https://www.tanzeem.org/distance-learning/",
                "children": []
            },
            {
                "label": "Online Courses",
                "url": "https://lms.quranacademy.com/",
                "children": []
            }
        ]
    },
    {
        "label": "Resources",
        "url": "https://www.tanzeem.org/#",
        "children": [
            {
                "label": "Audios",
                "url": "https://www.tanzeem.org/audio-2/",
                "children": [
                    {
                        "label": "By Speaker",
                        "url": "https://www.tanzeem.org/audios/audios-by-category-2/",
                        "children": []
                    },
                    {
                        "label": "Audios By Category",
                        "url": "https://www.tanzeem.org/audios/audios-by-category/",
                        "children": []
                    },
                    {
                        "label": "Audio Books",
                        "url": "https://www.tanzeem.org/audio-books/",
                        "children": []
                    }
                ]
            },
            {
                "label": "Videos",
                "url": "https://www.tanzeem.org/videos/",
                "children": [
                    {
                        "label": "Videos By Category",
                        "url": "https://www.tanzeem.org/videos-by-category/",
                        "children": []
                    },
                    {
                        "label": "Videos By Speakers",
                        "url": "https://www.tanzeem.org/videos-by-speakers/",
                        "children": []
                    },
                    {
                        "label": "Dr. Israr Ahmad Lectures",
                        "url": "https://www.youtube.com/@DrIsrarRA",
                        "children": []
                    },
                    {
                        "label": "Dr. Israr Ahmad (Q&A)",
                        "url": "https://www.youtube.com/@AskDrIsrar",
                        "children": []
                    },
                    {
                        "label": "Bayan ul Quran",
                        "url": "https://www.youtube.com/@BiyanulQuran",
                        "children": []
                    },
                    {
                        "label": "Muntakab Nisab",
                        "url": "https://www.youtube.com/@MuntakhabNisab",
                        "children": []
                    },
                    {
                        "label": "Dr. Israr Ahmad (Video Clips)",
                        "url": "https://www.youtube.com/@DrIsrarAhmed_Official",
                        "children": []
                    }
                ]
            },
            {
                "label": "Books",
                "url": "https://www.tanzeem.org/books/",
                "children": [
                    {
                        "label": "Audio Books",
                        "url": "https://www.tanzeem.org/audio-books/",
                        "children": []
                    },
                    {
                        "label": "Books By Authors",
                        "url": "https://www.tanzeem.org/books_author-dr-israr-ahmed/by-authors/",
                        "children": []
                    },
                    {
                        "label": "Books by Category",
                        "url": "https://www.tanzeem.org/books-by-category/",
                        "children": []
                    }
                ]
            },
            {
                "label": "Magazines",
                "url": "https://www.tanzeem.org/magazines/",
                "children": [
                    {
                        "label": "Meesaq",
                        "url": "https://www.tanzeem.org/meesaq/",
                        "children": []
                    },
                    {
                        "label": "Hikmat-e-Quran",
                        "url": "https://www.tanzeem.org/hikmat-e-quran/",
                        "children": []
                    },
                    {
                        "label": "Nida-e-Khilafat",
                        "url": "https://www.tanzeem.org/nida-e-khilafat/",
                        "children": []
                    }
                ]
            },
            {
                "label": "Press Releases",
                "url": "https://www.tanzeem.org/press-releases/",
                "children": []
            },
            {
                "label": "Social Media",
                "url": "https://www.tanzeem.org/social-media/",
                "children": []
            },
            {
                "label": "Khitab-e-Jum'ah (Audio)",
                "url": "https://www.tanzeem.org/category-audio-code-002-mutfariq-khutbat-e-jumah/",
                "children": []
            },
            {
                "label": "FAQs",
                "url": "https://www.tanzeem.org/faq/",
                "children": []
            }
        ]
    },
    {
        "label": "Public Programs",
        "url": "https://www.tanzeem.org/khitabat_e_jummah_addresses/",
        "children": [
            {
                "label": "Dora-E-Quran",
                "url": "https://www.tanzeem.org/darse-quran/",
                "children": []
            },
            {
                "label": "Quranic Circles",
                "url": "https://www.tanzeem.org/quranic-circles/",
                "children": []
            },
            {
                "label": "Khitabat-e-Jummah Addresses",
                "url": "https://www.tanzeem.org/khitabat_e_jummah_addresses/",
                "children": []
            }
        ]
    },
    {
        "label": "Join Tanzeem",
        "url": "https://app.dhtr.org/contactus",
        "children": []
    },
    {
        "label": "Contact Us",
        "url": "https://www.tanzeem.org/contact-us/",
        "children": []
    }
];

function formatUrl(url: string | undefined) {
    if (!url) return "#";
    if (url.startsWith("https://www.tanzeem.org")) {
        const formatted = url.replace("https://www.tanzeem.org", "");
        return formatted === "" ? "/" : formatted;
    }
    return url;
}

async function insertMenuLevel(items: any[], parentId: string | null = null) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemId = crypto.randomUUID();
        const formattedUrl = formatUrl(item.url);
        const isOpenInNew = formattedUrl.startsWith("http") && !formattedUrl.includes("tanzeem.org");

        await db.insert(menuItems).values({
            id: itemId,
            label: item.label,
            url: formattedUrl,
            parentId,
            order: i,
            isOpenInNew,
            isVisible: true,
            menuType: "main",
        });

        if (item.children && item.children.length > 0) {
            await insertMenuLevel(item.children, itemId);
        }
    }
}

async function main() {
    console.log("Clearing existing menu items...");
    await db.delete(menuItems); // Clear existing menus

    console.log("Seeding menus...");
    await insertMenuLevel(menuData);

    console.log("Menus seeded successfully.");
}

main().catch(console.error).then(() => process.exit(0));
