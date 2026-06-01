import 'dotenv/config';
import { db } from '../db';
import { homeSliders, homeCampaigns, teamMembers, videos, books, magazines, settings, users } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
    console.log("Seeding homepage data...");

    const existingUsers = await db.select().from(users).limit(1);
    const authorId = existingUsers[0]?.id || "585fbfee-f92d-483c-b44a-b2c10641c174";

    // 1. Hero Sliders
    await db.insert(homeSliders).values([
        {
            id: uuidv4(),
            title: "Dora-e-Turjuma-e-Quran",
            imageUrl: "https://tanzeem.org/media/slide1.jpg",
            linkUrl: "/events/dora-e-turjuma-e-quran",
            isActive: true,
            order: 1
        }
    ]).onDuplicateKeyUpdate({ set: { imageUrl: "https://tanzeem.org/media/slide1.jpg", isActive: true } });

    // 2. Team Members (Leaders)
    for (const member of [
        {
            id: uuidv4(),
            name: "Dr. Israr Ahmed",
            designation: "The Founder",
            bio: "Dr. Israr Ahmed, born on April 26, 1932, in Hisar, was a prominent Pakistani Islamic theologian, philosopher, and scholar who founded Tanzeem-e-Islami in 1975.",
            isActive: true,
            order: 1,
            slug: "dr-israr-ahmed"
        },
        {
            id: uuidv4(),
            name: "Shujauddin Sheikh",
            designation: "Ameer of Tanzeem-e-Islami",
            bio: "Mohtaram Shujauddin Shaikh, the current Ameer of Tanzeem-e-Islami, was born on September 29, 1974. He has been guiding the organization since 2020.",
            isActive: true,
            order: 2,
            slug: "shujauddin-sheikh"
        }
    ]) {
        await db.insert(teamMembers).values(member).onDuplicateKeyUpdate({ set: { bio: member.bio, designation: member.designation } });
    }

    // 3. Campaigns (Spotlight)
    for (const campaign of [
        { id: uuidv4(), title: "Free Palestine", imageUrl: "", linkUrl: "/campaigns/palestine", isActive: true, order: 1 },
        { id: uuidv4(), title: "31 Ulama Kay 22 Nukaat", imageUrl: "", linkUrl: "/campaigns/nukaat", isActive: true, order: 2 },
        { id: uuidv4(), title: "Insdad-e-Sood Muhim", imageUrl: "", linkUrl: "/campaigns/sood", isActive: true, order: 3 },
        { id: uuidv4(), title: "Ithade Ummat", imageUrl: "", linkUrl: "/campaigns/ithead", isActive: true, order: 4 },
        { id: uuidv4(), title: "Bayan ul Qur'an", imageUrl: "", linkUrl: "/campaigns/bayan", isActive: true, order: 5 },
        { id: uuidv4(), title: "Protection of Blasphemy Law", imageUrl: "", linkUrl: "/campaigns/blasphemy", isActive: true, order: 6 }
    ]) {
        await db.insert(homeCampaigns).values(campaign).onDuplicateKeyUpdate({ set: { isActive: true } });
    }

    // 4. Videos
    for (const video of [
        { id: uuidv4(), title: "Zamana Gawah Hai", slug: "zamana-gawah-hai", videoUrl: "https://youtube.com", isFeatured: true, authorId },
        { id: uuidv4(), title: "Ameer Say Mulaqat", slug: "ameer-say-mulaqat", videoUrl: "https://youtube.com", isFeatured: true, authorId },
        { id: uuidv4(), title: "Khitab e Jummah", slug: "khitab-e-jummah", videoUrl: "https://youtube.com", isFeatured: true, authorId },
        { id: uuidv4(), title: "Policy Statement", slug: "policy-statement", videoUrl: "https://youtube.com", isFeatured: true, authorId }
    ]) {
        await db.insert(videos).values(video).onDuplicateKeyUpdate({ set: { videoUrl: video.videoUrl } });
    }

    // 5. Magazines
    for (const magazine of [
        { id: uuidv4(), title: "Hikmat e Quran", isFeatured: true, slug: "hikmat-e-quran", authorId },
        { id: uuidv4(), title: "MESSAQ", isFeatured: true, slug: "messaq", authorId },
        { id: uuidv4(), title: "Nida e Khilafat", isFeatured: true, slug: "nida-e-khilafat", authorId },
        { id: uuidv4(), title: "Perspective", isFeatured: true, slug: "perspective", authorId }
    ]) {
        await db.insert(magazines).values(magazine).onDuplicateKeyUpdate({ set: { isFeatured: true } });
    }

    // 6. Books
    for (const book of [
        { id: uuidv4(), title: "Bayan ul Quran", isFeatured: true, slug: "bayan-ul-quran", authorId },
        { id: uuidv4(), title: "More Asaan Arbi", isFeatured: true, slug: "asaan-arbi", authorId },
        { id: uuidv4(), title: "More Seerat (SAW)", isFeatured: true, slug: "seerat-saw", authorId },
        { id: uuidv4(), title: "More Books", isFeatured: true, slug: "more-books", authorId }
    ]) {
        await db.insert(books).values(book).onDuplicateKeyUpdate({ set: { isFeatured: true } });
    }

    // 7. Settings
    for (const setting of [
        { id: uuidv4(), group: "homepage", key: "youtube_url", value: "https://youtube.com/@tanzeemeislami", type: "text" },
        { id: uuidv4(), group: "homepage", key: "facebook_url", value: "https://facebook.com/tanzeemeislami", type: "text" },
        { id: uuidv4(), group: "homepage", key: "twitter_url", value: "https://twitter.com/tanzeemeislami", type: "text" },
        { id: uuidv4(), group: "homepage", key: "whatsapp_url", value: "https://wa.me/+924235869501", type: "text" },
        { id: uuidv4(), group: "homepage", key: "whatsapp_number", value: "+92 42 35869501", type: "text" },
        { id: uuidv4(), group: "homepage", key: "contact_email", value: "info@tanzeem.org", type: "text" },
        { id: uuidv4(), group: "homepage", key: "footer_address", value: "67-A, Johar Town, Lahore, Pakistan", type: "text" },
        { id: uuidv4(), group: "homepage", key: "footer_copyright", value: "© 2026 Tanzeem-e-Islami. All rights reserved.", type: "text" }
    ]) {
        await db.insert(settings).values(setting).onDuplicateKeyUpdate({ set: { value: setting.value } });
    }

    console.log("Seeding complete!");
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
