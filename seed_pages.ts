import { db } from './src/db';
import { pages } from './src/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

const ADMIN_AUTHOR = 'system-admin';

const pageData: { title: string; slug: string; isPublished: boolean }[] = [
  { title: 'Organization', slug: 'organization', isPublished: true },
  { title: 'Background', slug: 'organization/background', isPublished: true },
  { title: 'Mission Statement', slug: 'organization/mission-statement', isPublished: true },
  { title: 'Our Ideology', slug: 'organization/our-ideology', isPublished: true },
  { title: 'Basic Belief', slug: 'organization/our-ideology/basic-belief', isPublished: true },
  { title: 'Our Obligations', slug: 'organization/our-ideology/our-obligations', isPublished: true },
  { title: 'Our Methodology', slug: 'organization/our-ideology/methodology', isPublished: true },
  { title: 'Foundation', slug: 'organization/our-ideology/foundation', isPublished: true },
  { title: 'The Founder', slug: 'organization/the-founder', isPublished: true },
  { title: 'The Ameer', slug: 'organization/the-ameer', isPublished: true },
  { title: 'Resources', slug: 'resources', isPublished: true },
  { title: 'Audios', slug: 'resources/audios', isPublished: true },
  { title: 'Audios By Speaker', slug: 'resources/audios/by-speaker', isPublished: true },
  { title: 'Audios By Category', slug: 'resources/audios/by-category', isPublished: true },
  { title: 'Audio Books', slug: 'resources/audio-books', isPublished: true },
  { title: 'Videos', slug: 'resources/videos', isPublished: true },
  { title: 'Videos By Category', slug: 'resources/videos/by-category', isPublished: true },
  { title: 'Videos By Speakers', slug: 'resources/videos/by-speakers', isPublished: true },
  { title: 'Books', slug: 'resources/books', isPublished: true },
  { title: 'Books by Category', slug: 'resources/books/by-category', isPublished: true },
  { title: 'Magazines', slug: 'resources/magazines', isPublished: true },
  { title: 'Meesaq', slug: 'resources/magazines/meesaq', isPublished: true },
  { title: 'Hikmat-e-Quran', slug: 'resources/magazines/hikmat-e-quran', isPublished: true },
  { title: 'Nida-e-Khilafat', slug: 'resources/magazines/nida-e-khilafat', isPublished: true },
  { title: 'Press Releases', slug: 'resources/press-releases', isPublished: true },
  { title: 'Social Media', slug: 'resources/social-media', isPublished: true },
  { title: "Khitab-e-Jum'ah", slug: 'resources/khitab-e-jumah', isPublished: true },
  { title: 'Public Programs', slug: 'public-programs', isPublished: true },
  { title: 'Quranic Circles', slug: 'public-programs/quranic-circles', isPublished: true },
  { title: 'Khitabat-e-Jummah', slug: 'public-programs/khitabat-e-jummah', isPublished: true },
  { title: 'FAQs', slug: 'faq', isPublished: true },
  { title: 'Contact Us', slug: 'contact', isPublished: true },
  { title: 'History of Tanzeem-e-Islami', slug: 'history-of-tanzeem-e-islami', isPublished: true },
];

async function seed() {
  console.log('Seeding pages with full URL slugs...');
  for (const page of pageData) {
    try {
      const existing = await db.query.pages.findFirst({
        where: eq(pages.slug, page.slug),
      });

      if (!existing) {
        await db.insert(pages).values({
          id: uuidv4(),
          title: page.title,
          slug: page.slug,
          isPublished: page.isPublished,
          authorId: ADMIN_AUTHOR,
          content: `<h1>${page.title}</h1><p>Content for ${page.title}. Edit this page in the Site Manager.</p>`,
        });
        console.log(`Created: ${page.slug}`);
      } else {
        console.log(`Exists: ${page.slug}`);
      }
    } catch (err) {
      console.error(`Failed ${page.slug}:`, err);
    }
  }
  console.log('Done.');
  process.exit(0);
}

seed();
