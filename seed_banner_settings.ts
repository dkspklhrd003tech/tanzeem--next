import { db } from './src/db';
import { settings } from './src/db/schema';
import { v4 as uuidv4 } from 'uuid';

const bannerSettings = [
  { key: 'banner_bg_image', value: 'https://images.unsplash.com/photo-1518005020251-0eb5c1842971?q=80&w=1920&auto=format&fit=crop', group: 'global_banner' },
  { key: 'banner_overlay_color', value: '#005031', group: 'global_banner' },
  { key: 'banner_overlay_opacity', value: '0.7', group: 'global_banner' },
  { key: 'banner_text_color', value: '#ffffff', group: 'global_banner' },
  { key: 'banner_height', value: '350px', group: 'global_banner' },
  { key: 'banner_breadcrumb_separator', value: '›', group: 'global_banner' },
  { key: 'banner_show_breadcrumbs', value: 'true', group: 'global_banner' },
];

async function seedBannerSettings() {
  console.log('Seeding banner settings...');
  for (const s of bannerSettings) {
    try {
      await db.insert(settings)
        .values({
          id: uuidv4(),
          key: s.key,
          value: s.value,
          group: s.group,
          type: 'text'
        })
        .onDuplicateKeyUpdate({
          set: {
            value: s.value,
            group: s.group
          }
        });
      console.log(`Seeded: ${s.key}`);
    } catch (err) {
      console.error(`Failed to seed ${s.key}:`, err);
    }
  }
  console.log('Banner settings seeded.');
  process.exit(0);
}

seedBannerSettings();
