import { db } from './src/db';
import { pages } from './src/db/schema';
import { v4 as uuidv4 } from 'uuid';

const pageData = [
  // Header
  { title: 'Home', slug: 'home', isPublished: true },
  { title: 'Organization', slug: 'organization', isPublished: true },
  { title: 'Background', slug: 'background', isPublished: true },
  { title: 'Mission Statement', slug: 'mission-statement', isPublished: true },
  { title: 'Our Ideology', slug: 'our-ideology', isPublished: true },
  { title: 'Basic Belief', slug: 'basic-belief', isPublished: true },
  { title: 'Our Obligations', slug: 'our-obligations', isPublished: true },
  { title: 'Methodology', slug: 'methodology', isPublished: true },
  { title: 'Foundation', slug: 'foundation', isPublished: true },
  { title: 'The Founder', slug: 'the-founder', isPublished: true },
  { title: 'The Ameer', slug: 'the-ameer', isPublished: true },
  { title: 'Markaz Tanzeem', slug: 'markaz-tanzeem', isPublished: true },
  { title: 'Distance Learning', slug: 'distance-learning', isPublished: true },
  { title: 'Audios', slug: 'audio-2', isPublished: true },
  { title: 'Audios By Speaker', slug: 'audios-by-category-2', isPublished: true },
  { title: 'Audios By Category', slug: 'audios-by-category', isPublished: true },
  { title: 'Audio Books', slug: 'audio-books', isPublished: true },
  { title: 'Videos', slug: 'videos', isPublished: true },
  { title: 'Videos By Category', slug: 'videos-by-category', isPublished: true },
  { title: 'Videos By Speakers', slug: 'videos-by-speakers', isPublished: true },
  { title: 'Books', slug: 'books', isPublished: true },
  { title: 'Books By Author', slug: 'books_author-dr-israr-ahmed/by-authors', isPublished: true },
  { title: 'Books by Category', slug: 'books-by-category', isPublished: true },
  { title: 'Magazines', slug: 'magazines', isPublished: true },
  { title: 'Meesaq', slug: 'meesaq', isPublished: true },
  { title: 'Hikmat-e-Quran', slug: 'hikmat-e-quran', isPublished: true },
  { title: 'Nida-e-Khilafat', slug: 'nida-e-khilafat', isPublished: true },
  { title: 'Press Releases', slug: 'press-releases', isPublished: true },
  { title: 'Social Media', slug: 'social-media', isPublished: true },
  { title: 'Khitab-e-Jumah', slug: 'category-audio-code-002-mutfariq-khutbat-e-jumah', isPublished: true },
  { title: 'FAQs', slug: 'faq', isPublished: true },
  { title: 'Quranic Circles', slug: 'quranic-circles', isPublished: true },
  { title: 'Contact Us', slug: 'contact-us', isPublished: true },

  // Footer Specific
  { title: 'Introduction', slug: 'introduction', isPublished: true },
  { title: 'History', slug: 'history', isPublished: true },
  { title: 'Founder', slug: 'founder', isPublished: true },
  { title: 'Ameer', slug: 'ameer', isPublished: true },
  { title: 'Join Tanzeem', slug: 'join', isPublished: true },
  { title: 'Resources Audios', slug: 'resources/audios', isPublished: true },
  { title: 'Resources Articles', slug: 'resources/articles', isPublished: true },
  { title: 'Resources Press', slug: 'resources/press', isPublished: true },
  { title: 'Resources Magazines', slug: 'resources/magazines', isPublished: true },
  { title: 'Resources Videos', slug: 'resources/videos', isPublished: true },
];

async function seed() {
  console.log('Seeding pages...');
  for (const page of pageData) {
    try {
      // Normalize slug: get last segment
      const slugSegments = page.slug.split('/');
      const finalSlug = slugSegments[slugSegments.length - 1];

      const existing = await db.query.pages.findFirst({
        where: (pages, { eq }) => eq(pages.slug, finalSlug)
      });

      if (!existing) {
        await db.insert(pages).values({
          id: uuidv4(),
          title: page.title,
          slug: finalSlug,
          isPublished: page.isPublished,
          content: `<h1>${page.title}</h1><p>Welcome to the ${page.title} page. This content is dynamically managed via the CMS.</p>`,
        });
        console.log(`Created page: ${page.title} (slug: ${finalSlug})`);
      } else {
        console.log(`Page already exists: ${page.title} (slug: ${finalSlug})`);
      }
    } catch (err) {
      console.error(`Failed to create page ${page.title}:`, err);
    }
  }
  console.log('Seeding complete.');
  process.exit(0);
}

seed();
