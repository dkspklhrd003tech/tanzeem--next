# Tanzeem-e-Islami — Design System

## Project Overview

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Animation:** Framer Motion
- **Database:** MySQL via Drizzle ORM
- **Content:** Hybrid static + CMS-driven (WordPress migration target)
- **Fonts:** Amiri (UI), Noto Nastaliq Urdu (Urdu), Jameel Noori Nastaleeq (calligraphic)
- **Analytics:** Google Analytics (G-B6P9KW8X46)

---

## Information Architecture

### Global Navigation

```
Home (/)
├── Organization (/organization)
│   ├── Background (/organization/background)
│   ├── Mission Statement (/organization/mission-statement)
│   ├── Our Ideology (/organization/our-ideology)
│   │   ├── Basic Belief (/organization/our-ideology/basic-belief)
│   │   ├── Our Obligations (/organization/our-ideology/our-obligations)
│   │   ├── Our Methodology (/organization/our-ideology/methodology)
│   │   └── Foundation (/organization/our-ideology/foundation)
│   ├── The Founder (/organization/the-founder)
│   └── The Ameer (/organization/the-ameer)
├── Education (/distance-learning)
│   ├── Ruju Ilal Quran (/ruju-ilal-quran)
│   ├── Distance Learning (/distance-learning)
│   └── Online Courses (/online-courses)
├── Resources (/resources)
│   ├── Audios
│   │   ├── By Speaker (/resources/audios/by-speaker)
│   │   ├── By Category (/resources/audios/by-category)
│   │   └── Audio Books (/resources/audio-books)
│   ├── Videos
│   │   ├── By Category (/resources/videos/by-category)
│   │   ├── By Speakers (/resources/videos/by-speakers)
│   │   └── External links (YouTube channels)
│   ├── Books
│   │   ├── By Author (/books-by-author)
│   │   └── By Category (/resources/books/by-category)
│   ├── Magazines
│   │   ├── Meesaq (/resources/magazines/meesaq)
│   │   ├── Hikmat-e-Quran (/resources/magazines/hikmat-e-quran)
│   │   ├── Nida-e-Khilafat (/resources/magazines/nida-e-khilafat)
│   │   └── Perspective (/resources/magazines/perspective)
│   ├── Press Releases (/resources/press-releases)
│   ├── Social Media (/resources/social-media)
│   ├── Khitab-e-Jum'ah (/resources/khitab-e-jumah)
│   └── FAQ (/faq)
├── Quranic Circles (/quranic-circles)
├── Contact Us (/contact)
└── Join Tanzeem (https://app.dhtr.org/contactus — external)
```

### URL Architecture

| Pattern | Type | Example |
|---------|------|---------|
| `/` | Homepage | `/` |
| `/[slug]` | CMS Pages | `/organization/the-founder` |
| `/resources/[type]` | Resource listing | `/resources/audios` |
| `/resources/[type]/[slug]` | Resource detail | `/resources/audios/my-lecture` |
| `/resources/[type]/by-[facet]` | Filtered listing | `/resources/videos/by-category` |
| `/resources/magazines/[series]/[year]` | Year archive | `/resources/magazines/meesaq/2024` |
| `/events/[slug]` | Event detail | `/events/ramadan-2025` |
| `/search?q=...` | Search | `/search?q=quran` |
| `/public-programs/[...slug]` | Program pages | `/public-programs/quranic-circles` |
| `/sitemanager` | Admin panel | `/sitemanager` |

### Section Taxonomy

Pages belong to these content sections:
1. **Organization** — About, leadership, ideology
2. **Education** — Learning programs and courses
3. **Resources** — Media library (audio, video, books, magazines)
4. **Quranic Circles** — Physical study circle locations
5. **Events** — Scheduled programs and activities
6. **Press Releases** — Official announcements
7. **FAQ** — Frequently asked questions
8. **Contact** — Get in touch

---

## Content Model Analysis

### Entity: Page

**Purpose:** CMS-managed static pages with dynamic section composition.

**Fields:**
```
id, title, slug (unique), content (HTML+SEO comment), excerpt,
featuredImage, template (default/custom), parentId (self-FK),
order, isPublished, showInMenu, metaTitle, metaDescription,
metaKeywords, authorId (FK -> users), publishedAt, createdAt, updatedAt
```

**Section composition** (via `pageSections` table):
```
type: hero | intro | stats | accordion | team | media_grid | publications | cta_banner | embed
config: JSON (type-specific props)
order: number
isActive: boolean
```

**URL:** `/{slug}` (catch-all route)

**SEO:** Metadata extracted from `<!--SEO_METADATA_JSON:...-->` comment in content. Supports `canonicalUrl`, `noIndex`, `ogTitle`, `ogImage`, `schemaType`, `schemaJsonLd`.

---

### Entity: Audio

**Purpose:** Islamic lecture recordings.

**Fields:** `id, title, slug, description, audioUrl, duration, fileSize, thumbnailUrl, categoryId (FK), speakerId (FK), isPublished, isFeatured, order, playCount, downloadCount, metaTitle, metaDescription, authorId (FK), publishedAt`

**URLs:** Listing `/resources/audios`, Detail `/resources/audios/{slug}`, By speaker `/resources/audios/by-speaker`, By category `/resources/audios/by-category`

**Relationships:** Belongs to `audioCategories`, belongs to `speakers`

---

### Entity: Video

**Purpose:** Islamic lecture videos (YouTube embeds + native).

**Fields:** `id, title, slug, description, videoUrl, embedUrl, thumbnailUrl, duration, categoryId (FK), speakerId (FK), isPublished, isFeatured, order, viewCount, metaTitle, metaDescription, authorId (FK), publishedAt`

**URLs:** Listing `/resources/videos`, Detail `/resources/videos/{slug}`, By speaker `/resources/videos/by-speakers`, By category `/resources/videos/by-category`

**Relationships:** Belongs to `videoCategories`, belongs to `speakers`

---

### Entity: Book

**Purpose:** Digital Islamic books (PDF).

**Fields:** `id, title, slug, description, coverImage, fileUrl, fileSize, pages, language (default: urdu), categoryId (FK), authorName, isPublished, isFeatured, order, downloadCount, metaTitle, metaDescription, authorId (FK), publishedAt`

**URLs:** Listing `/resources/books`, Detail `/resources/books/{slug}`, By author `/books-by-author`, By category `/resources/books/by-category`

**Relationships:** Belongs to `bookCategories`

---

### Entity: Magazine

**Purpose:** Periodical publications (PDF).

**Fields:** `id, title, slug, description, coverImage, fileUrl, fileSize, issueNumber, publishDate, isPublished, isFeatured, order, downloadCount, metaTitle, metaDescription, authorId (FK)`

**URLs:** Listing `/resources/magazines`, Detail `/resources/magazines/{slug}`, Series `/resources/magazines/{seriesSlug}`, Year archive `/resources/magazines/{seriesSlug}/{year}`

**Series identified:** `meesaq`, `hikmat-e-quran`, `nida-e-khilafat`, `perspective`

---

### Entity: Event

**Purpose:** Scheduled programs and activities.

**Fields:** `id, title, slug, description, content, thumbnailUrl, startDate, endDate, location, address, isOnline, onlineUrl, isPublished, registrationRequired, registrationUrl, metaTitle, metaDescription, authorId (FK)`

**URLs:** Listing `/events`, Detail `/events/{slug}`, Categories `/events/categories`, Locations `/events/locations`, Upcoming `/events/upcoming`, Past `/events/past`

---

### Entity: Press Release

**Purpose:** Official organizational announcements.

**Fields:** `id, title, slug, content, excerpt, featuredImage, isPublished, publishedAt, metaTitle, metaDescription`

**URL:** `/press-releases/{slug}`

---

### Entity: Speaker

**Purpose:** Content creators/presenters for audio and video.

**Fields:** `id, name, slug, bio, avatar`

**Relationships:** Has many `audio` files, has many `videos`

---

### Entity: Home Slider

**Purpose:** Hero carousel slides on homepage.

**Fields:** `id, title, imageUrl, linkUrl, order, isActive`

---

### Entity: Home Campaign

**Purpose:** Spotlight campaign cards on homepage.

**Fields:** `id, title, imageUrl, linkUrl, order, isActive`

---

### Entity: Team Member

**Purpose:** Organization leadership profiles.

**Fields:** `id, name, slug, designation, bio, avatar, email, phone, order, isActive`

---

### Entity: Darse-Quran Event

**Purpose:** Quran study circle schedules.

**Fields:** `id, city, time, address, type, hasLadiesArrangement, mudarris, contact, isPublished`

---

### Entity: Sermon

**Purpose:** Friday sermons (Khitab-e-Jum'ah).

**Fields:** `id, title, slug, description, audioUrl, videoUrl, thumbnailUrl, duration, sermonDate, speakerName, isPublished, metaTitle, metaDescription`

---

### Entity: Post

**Purpose:** Blog/articles.

**Fields:** `id, title, slug, content, excerpt, featuredImage, categoryId (FK), isPublished, isFeatured, viewCount, tags, meta* fields, authorId (FK), publishedAt`

**Relationships:** Belongs to `postCategories`

---

### Entity: Social Platform / Social Account

**Purpose:** Social media presence configuration.

**Platform:** `id, name, slug, iconUrl, themeColor, order, isActive`

**Account:** `id, platformId (FK), title, url, imageUrl, buttonText, order, isActive`

---

### Entity: Menu Item

**Purpose:** Navigation structure.

**Fields:** `id, label, url, parentId (self-FK), order, isOpenInNew, isVisible, menuType (main/footer)`

---

### Entity: Location

**Purpose:** Physical addresses for events and circles.

**Fields:** `id, name, slug, address, city, country, phone, email, isActive`

---

### Entity: Form Submission

**Purpose:** Contact/join form entries.

**Fields:** `id, formType (contact/join), name, email, phone, subject, message, isRead, isReplied, repliedAt`

---

### Entity: Playlist

**Purpose:** Curated collections of audio/video.

**Fields:** `id, title, slug, description, thumbnailUrl, type (video/audio), itemIds (CSV), isPublished, order`

---

## Design System

### Color System

#### Brand Colors (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#0d5844` | Primary actions, headings, accents |
| `--primary-foreground` | `#fefefc` | Text on primary backgrounds |
| `--primary-light` | `#007a4d` | Hover states, lighter accents |
| `--primary-dark` | `--primary` | Active states, deeper accents |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#f5f5f0` | Page background |
| `--background-secondary` | `#ffffff` | Card/section backgrounds |
| `--background-dark` | `#111111` | Footer background |
| `--foreground` | `#111111` | Body text |
| `--foreground-muted` | `#6b7280` | Secondary text, captions |
| `--foreground-light` | `#9ca3af` | Disabled text, placeholders |
| `--border` | `#e5e7eb` | Borders, dividers |
| `--ring` | `#0d5844` | Focus ring color |
| `--card` | `#ffffff` | Card surface |
| `--card-foreground` | `#222222` | Card text |
| `--destructive` | `#ef4444` | Error states, destructive actions |
| `--destructive-foreground` | `#fefefc` | Text on destructive |

#### Dark Mode (`.dark`)

| Token | Value |
|-------|-------|
| `--background` | `#0a0a0a` |
| `--background-secondary` | `#171717` |
| `--foreground` | `#fefefc` |
| `--foreground-muted` | `#a1a1aa` |
| `--card` | `#171717` |
| `--primary` | `#007a4d` |
| `--border` | `#262626` |

#### Chart Colors

`--chart-1` through `--chart-5`: Green spectrum (`#0d5844` → `#66cd9c`)

#### Social Brand Colors

| Platform | Color |
|----------|-------|
| YouTube | `#dc2626` (red-600) |
| Facebook | `#2563eb` (blue-600) |
| X (Twitter) | `#000000` |
| WhatsApp | `#22c55e` (green-500) |

---

### Typography

#### Font Families

| Token | Font Stack | Usage |
|-------|-----------|-------|
| `--font-amiri` | Amiri (Google Font) | Display headings, Arabic/Urdu text |
| `font-body` | system-ui, -apple-system, sans-serif | Body text, UI elements |
| `font-urdu` | Noto Nastaliq Urdu | Urdu content |
| `font-nastaleeq` | Jameel Noori Nastaleeq, Noto Nastaliq Urdu | Calligraphic Urdu (RTL) |

#### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display 1 | `text-5xl` (3rem) | Black (900) | `tight` | Hero headlines only |
| Display 2 | `text-4xl` (2.25rem) | Black (900) | `tight` | Section headings |
| Heading 1 | `text-3xl` (1.875rem) | Bold (700) | `relaxed` | Page titles |
| Heading 2 | `text-2xl` (1.5rem) | Bold (700) | `normal` | Section titles |
| Heading 3 | `text-xl` (1.25rem) | Bold (700) | `normal` | Card titles |
| Heading 4 | `text-lg` (1.125rem) | Semibold (600) | `normal` | Subsection titles |
| Body | `text-sm`/`text-base` (0.875-1rem) | Normal (400) | `relaxed` | Paragraphs |
| Caption | `text-xs` (0.75rem) | Medium (500) | `normal` | Labels, timestamps |
| Small | `text-[10px]` | Medium (500) | `normal` | Legal, badges |

#### Responsive Adjustments

- Display sizes scale down by 1-2 levels on mobile (`text-4xl` → `text-3xl`)
- Section headings use mobile-first sizing with `md:*` breakpoints
- Body text remains `text-sm` on mobile, `text-base` on desktop

---

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `0.25rem` (4px) | Icons from text |
| `space-2` | `0.5rem` (8px) | Tight component gaps |
| `space-3` | `0.75rem` (12px) | Label to content |
| `space-4` | `1rem` (16px) | Card padding, grid gaps |
| `space-5` | `1.25rem` (20px) | Section bottom margin |
| `space-6` | `1.5rem` (24px) | Between items |
| `space-8` | `2rem` (32px) | Section padding |
| `space-10` | `2.5rem` (40px) | Between sections |
| `space-14` | `3.5rem` (56px) | Large section padding |
| `space-16` | `4rem` (64px) | Section vertical padding |

#### Section Spacing Pattern

```
Mobile:  py-14 (3.5rem)
Desktop: md:py-8 (4rem)
```

#### Grid Gaps

```
Card grid:    gap-8 (2rem)
Compact grid: gap-5 (1.25rem)
```

---

### Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements, badges |
| `--radius-md` | 8px | Inputs, buttons |
| `--radius-lg` | 12px | Cards, dialogs |
| `--radius-xl` | 16px | Large containers |
| `rounded-full` | 9999px | Pills, avatars, icon buttons |

**Default radius** (`--radius`): `0.5rem` (8px)

---

### Shadow System

| Level | Token | Usage |
|-------|-------|-------|
| Flat | `shadow-sm` | Cards, subtle elevation |
| Raised | `shadow-md` | Hover states |
| Elevated | `shadow-lg` | Dropdowns, modals |
| High | `shadow-xl` | Active modals |
| Hover | `hover:shadow-lg` + `hover:-translate-y-2` | Card hover states |

---

## Layout System

### Containers

```
Default max-width: 1240px
Class: .container
```

Container padding:
```
Mobile: px-0 (edge-to-edge)
sm+:    px-4
```

### Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

### Grid System

Column defaults:
```
Mobile: grid-cols-1
Tablet: md:grid-cols-2
Desktop: lg:grid-cols-3 or lg:grid-cols-4
```

Common grid patterns:
- **1-col:** Mobile-first, single column
- **2-col:** Tablet (`md:grid-cols-2`)
- **3-col:** Desktop campaigns (`lg:grid-cols-3`)
- **4-col:** Desktop media grids (`lg:grid-cols-4`)
- **5-col:** Footer columns (`lg:grid-cols-5`)

---

## Component Inventory

### Layout Components

#### Header (`src/components/layout/Header.tsx`)

**Purpose:** Global navigation with top social bar, sticky main navigation, mobile sheet menu, search.

**Anatomy:**
```
Skip-to-content link
Top Bar: Social icons (YouTube, FB, X, WhatsApp) | Gregorian + Hijri date
Sticky Header: Logo | Desktop Nav (mega-menu) | Search | Mobile hamburger
```

**Variants:**
- Default: Transparent, white background
- Scrolled: Adds `shadow-md`

**States:**
- Default, Hover (links/buttons), Focus-visible (all interactive), Active (tap), Scrolled (sticky shadow)

**Desktop Navigation:**
- Top-level items: hover/click to open dropdown
- Multi-level: supports 3 levels via nested `DesktopMenuItem`
- Mega-menu: arrow key navigation, mouse hover open/close
- All dropdown buttons have `aria-haspopup="true"` and `aria-expanded`

**Mobile Navigation:**
- Sheet component (slide-in from right, 320px width)
- Accordion-style submenu expansion
- Full-width "JOIN TANZEEM" CTA button at bottom
- Close on navigation

**Accessibility:**
- Skip-to-content link at top
- Search input has `aria-label="Search the site"`
- Dropdown toggles have `aria-haspopup` / `aria-expanded`
- Social links have `aria-label="... — opens in new tab"`
- All interactive elements have `focus-visible` rings
- Date display uses proper `lang` and `dir` attributes for Urdu

**Design Tokens:** `bg-card`, `bg-secondary`, `border-border`, `text-primary`, `text-foreground`, `text-foreground-muted`, `bg-primary`, `text-primary-foreground`

---

#### Footer (`src/components/layout/Footer.tsx`)

**Purpose:** Site-wide footer with link columns, contact info, social links, copyright.

**Anatomy:**
```
5-column grid: About Us | Audios | Books & Articles | Videos | Contact Us
Separator
Bottom bar: Copyright | Social icons
```

**States:** Default, Hover (links turn white), Focus-visible (ring on all links)

**Accessibility:**
- Social icon links have `aria-label="... — opens in new tab"`
- All links have `focus-visible` rings
- Contact links (`tel:`, `mailto:`) use semantic `<a>` elements
- Decorative icons have `aria-hidden="true"`

**Design Tokens:** `bg-background-dark`, `text-white/70` (text on dark), `text-primary-foreground`

---

#### PageBanner (`src/components/layout/PageBanner.tsx`)

**Purpose:** Full-width hero banner on interior pages (not homepage).

**Anatomy:**
```
Background image (cover) | Color overlay | Centered content: Breadcrumbs (optional) | Page title
```

**States:** Default (loading banner image), Error (fallback gradient)

**Accessibility:**
- Banner image is decorative (background image, not `<img>`)
- Breadcrumb links are keyboard accessible

**Design Tokens:** Background image from settings, overlay color configurable, overlay opacity default 0.6

---

### Homepage Components

#### Hero (`src/components/home/Hero.tsx`)

**Purpose:** Full-width auto-rotating image carousel with navigation.

**Anatomy:**
```
<section role="region" aria-roledescription="carousel">
  Slide image (with link) | Navigation arrows (prev/next) | Pagination dots (role="tablist")
  Screenreader: aria-live polite status
</section>
```

**Variants:**
- With slides data (DB content)
- Fallback mode (hardcoded slides when DB empty)

**States:**
- Default: Slide visible with auto-rotate (8s interval)
- Hover: Arrow buttons appear (desktop only)
- Focus-within: Arrows appear, auto-rotation pauses
- Paused: On mouse enter / focus within any control
- Playing: Auto-rotating
- Error: Image load failure shows placeholder with title text
- Single slide: No arrows or dots, no auto-rotation

**Accessibility:**
- `role="region"` with `aria-roledescription="carousel"` and `aria-label`
- `aria-live="polite"` on slide content for screen reader announcements
- Pagination dots: `role="tablist"`, each dot `role="tab"` with `aria-selected` and `aria-label="Slide N: title"`
- Prev/next buttons: `aria-label="Previous slide"` / `"Next slide"`
- Auto-rotation pauses on hover, focus, or focus-within
- Keyboard navigation: ArrowLeft / ArrowRight when carousel is focused
- Pause/resume state announced via `aria-live="polite"`
- All icons have `aria-hidden="true"`
- Pagination dot hit areas are minimum 24×24px (WCAG 2.5.8)

**Design Tokens:** `bg-background-secondary`, `bg-primary`, `text-primary`, `text-primary-foreground`

---

#### AboutAndLeaders (`src/components/home/AboutAndLeaders.tsx`)

**Purpose:** Organization mission statement + leadership team profiles.

**Anatomy:**
```
<section aria-labelledby>
  Mission box (primary bg): Logo image | Label + Title + Description + CTA button
  Leader cards (2-col grid): Avatar | Designation | Name | Bio | Link
</section>
```

**States:**
- Default: Content visible
- Hover: Card `shadow-md` toggles
- Focus-visible: Button/Link rings
- Loading: Skeleton pulse placeholders for team cards (2 cards)
- Error: Image `onError` fallback to `/logo.png`, then hides on second failure
- Empty: Skeleton placeholders rendered when `team.length === 0`

**Accessibility:**
- `aria-labelledby` on section referencing `h2`
- Leader grid has `role="list"` and each card `role="listitem"`
- Logo image `alt="Tanzeem-e-Islami logo"`
- Avatar images use member name as alt text
- Skeleton loaders have `aria-hidden="true"`

**Design Tokens:** `bg-card`, `bg-primary`, `text-primary`, `text-primary-foreground`, `text-foreground`, `border-border`, `bg-muted`

---

#### SpotlightCampaigns (`src/components/home/SpotlightCampaigns.tsx`)

**Purpose:** Promotional campaign card grid (announcements, events).

**Anatomy:**
```
<section aria-labelledby>
  Heading + subtitle
  3-col grid: Campaign cards (<a> tag)
    Image (348:195 ratio) | Gradient overlay | Link icon | Title
</section>
```

**States:**
- Default: Card with image and title
- Hover: Scale image (110%), show overlay gradient, show link icon, card lifts (-translate-y-2), shadow intensifies
- Focus-visible: Outline ring on card link
- Loading: 3 skeleton pulse placeholders (image + text lines)
- Error: Image failure hides img element
- Empty: Campaign placeholder with icon and "Visual Preview Pending" text
- No link: Card is non-interactive `<div>`

**Accessibility:**
- Cards are `<a>` elements (keyboard accessible natively) when `linkUrl` exists
- External links have `aria-label="title — opens in new tab"`
- Non-linked campaigns render as inert `<div>` elements
- Decorative elements (overlays, icons) have `aria-hidden="true"`
- Skeleton placeholders have `aria-hidden="true"`

**Design Tokens:** `bg-card`, `bg-muted`, `text-primary`, `text-foreground`, `text-foreground-muted`, `border-border`

---

#### MissionAndVideos (`src/components/home/MissionAndVideos.tsx`)

**Purpose:** Mission statement banner + featured video grid.

**Anatomy:**
```
<section aria-labelledby>
  Mission banner: Primary bg | Quote text | Decorative blurs
  Video grid (4-col): Video cards (<a> tag)
    Thumbnail (348:195) | Play overlay | Gradient | Title
</section>
```

**States:**
- Default: Banner + videos visible
- Hover: Card lifts, thumbnail scales, play button appears
- Focus-visible: Outline ring on video links
- Loading: 4 skeleton pulse placeholders
- Error: Thumbnail failure hides img, shows "Thumbnail Pending" placeholder
- Empty: Skeleton grid shown

**Accessibility:**
- Video cards are `<a>` elements with `aria-label="title — opens video in new tab"`
- Decorative elements (blur circles, overlays, play icon) have `aria-hidden="true"`
- Skeleton placeholders have `aria-hidden="true"`

**Design Tokens:** `bg-primary`, `bg-card`, `text-primary`, `text-primary-foreground`, `text-foreground`, `border-border`

---

#### PublicationsGrid (`src/components/home/PublicationsGrid.tsx`)

**Purpose:** Featured magazines and books display.

**Anatomy:**
```
Magazines section: Heading + subtitle + "About Magazines" link
  4-col grid: Magazine cards (cover 240×332) | Issue number | "More" link
Books section: Heading + subtitle + "About Books" link
  4-col grid: Book cards (cover 240×332) | "Read" link
```

**States:**
- Default: Covers with shadows
- Hover: Card lifts (-translate-y-2), shadow intensifies, cover scales (105%), blur glow effect
- Focus-visible: Outline ring on all links
- Loading: 4 skeleton rectangles per section
- Error: Cover image hides on failure, shows placeholder icon
- Empty: Skeleton rectangles shown

**Accessibility:**
- `aria-labelledby` on each section
- All cover images have alt text with title
- Link text is descriptive ("More {title}")
- Decorative elements (overlays, blur glows, icons) have `aria-hidden="true"`
- Skeleton loaders have `aria-hidden="true"`

**Design Tokens:** `bg-card`, `text-primary`, `text-foreground`, `text-foreground-muted`, `text-foreground/50`, `border-border`

---

#### LatestPressReleases (`src/components/home/LatestPressReleases.tsx`)

**Purpose:** Latest 3 press releases with expandable detail dialog.

**Anatomy:**
```
<section aria-labelledby>
  Heading + subtitle + "View all" link
  3-col grid: Press release cards (<button>)
    Date | Title | Excerpt | "Read full release" link
  Dialog/modal: Full content
</section>
```

**States:**
- Default: Card with date, title, excerpt
- Hover: Border highlights (primary/30)
- Focus-visible: Outline ring on cards and links
- Active: Dialog opens on click/Enter/Space
- Dialog open: Full content with scroll, close on overlay click or Escape
- Empty: Section not rendered when `items.length === 0`

**Accessibility:**
- Cards are `<button>` elements (natively keyboard accessible)
- Inner "Read full release" button has `tabIndex={-1}` (prevents duplicate focus targets)
- Dialog uses `<Dialog>` from Radix with proper focus trapping
- Decorative icons have `aria-hidden="true"`

**Design Tokens:** `bg-background`, `bg-card`, `text-primary`, `text-foreground`, `text-foreground-muted`, `border-border`

---

#### CTA (`src/components/home/CTA.tsx`)

**Purpose:** Social media connection call-to-action.

**Anatomy:**
```
<section aria-labelledby>
  Pattern background | Heading + subtitle
  Social platform buttons: Circular icon + platform name + follower count
</section>
```

**States:**
- Default: Circular icons with brand colors
- Hover: Scale up (108%), lift (-4px)
- Focus-visible: Outline ring with offset
- Active: Scale down (0.95)

**Accessibility:**
- Each platform link has `aria-label="Platform name — opens in new tab"`
- SVG icons have `aria-hidden="true"`
- Decorative pattern has `aria-hidden="true"`
- `aria-labelledby` on section

**Design Tokens:** `bg-primary`, `text-primary-foreground`, brand colors (red-600, blue-600, black, green-500)

---

### Resource Components

#### AudioList (`src/components/resources/AudioList.tsx`)

**Purpose:** Searchable, filterable list of audio lectures.

**States:** Loading (skeleton), Empty ("No audio files found"), Error (fetch failure), Filtered (active filters), Default (full list)

**Accessibility:** Search input has `aria-label`, category/speaker selects have labels, each item has `AudioPlayButton` with accessible name.

---

#### AudioDetail (`src/components/resources/AudioDetail.tsx`)

**Purpose:** Full audio lecture detail with player.

**States:** Loading, Loaded (with metadata + native `<audio>` player), Error, Not Found

**Accessibility:** Native `<audio>` element supports keyboard playback controls. Download link has descriptive aria-label.

---

#### VideoGrid (`src/components/resources/VideoGrid.tsx`)

**Purpose:** Searchable video grid with YouTube thumbnails.

**States:** Loading (skeleton grid), Empty ("No videos found"), Filtered, Default (full grid)

**Accessibility:** Cards are keyboard-accessible links. Play overlays are decorative. External video links section clearly labeled.

---

#### VideoDetail (`src/components/resources/VideoDetail.tsx`)

**Purpose:** Full video detail with embedded player.

**States:** Loading, Loaded (YouTube iframe or native `<video>`), Error, Not Found

**Accessibility:** YouTube iframe has `title` attribute. Native video supports keyboard controls.

---

#### BookGrid (`src/components/resources/BookGrid.tsx`)

**Purpose:** Searchable grid of book covers with download actions.

**States:** Loading (skeleton), Empty ("No books found"), Filtered, Default

**Accessibility:** Cover images have alt text. Download buttons have descriptive labels.

---

#### BookDetail (`src/components/resources/BookDetail.tsx`)

**Purpose:** Full book detail with read/download options.

**States:** Loading, Loaded, Error, Not Found

---

#### MagazineGrid (`src/components/resources/MagazineGrid.tsx`)

**Purpose:** Grid of magazine issues with series filtering.

**States:** Loading, Empty ("No magazines found"), Series-filtered, Default

---

#### SpeakerGrid (`src/components/resources/SpeakerGrid.tsx`)

**Purpose:** Grid of speaker/author cards with lecture counts.

**States:** Loading, Empty, Default

**Accessibility:** Cards link to speaker-filtered audio listing. Avatar images have alt text.

---

#### QuranicCirclesTable (`src/components/resources/QuranicCirclesTable.tsx`)

**Purpose:** Table of Quranic circle locations.

**States:** Loading (skeleton table), Empty ("No Quranic circles found"), Default

**Responsive:** Table columns collapse on mobile (City, Address, Contact visible; Circle, Time hide on small screens).

---

### Shared Components

#### IntroSection (`src/components/shared/IntroSection.tsx`)

**Purpose:** Image + text intro block with configurable alignment.

**Variants:** Image left, Image right. Background colors configurable.

**States:** Default, Loading (image skeleton)

---

#### StatsGrid (`src/components/shared/StatsGrid.tsx`)

**Purpose:** 4-column statistics display with large numbers.

**States:** Default (shows stats), Empty (hidden)

**Responsive:** 2-col on mobile, 4-col on desktop.

---

#### Accordion (`src/components/shared/Accordion.tsx`)

**Purpose:** Q&A accordion sections.

**States:** Default (all collapsed), Expanded (one or more items open)

**Accessibility:** Uses Radix Accordion with proper ARIA attributes.

---

#### TeamGrid (`src/components/shared/TeamGrid.tsx`)

**Purpose:** Team member profile cards with social links.

**States:** Default, Hover (social overlay appears)

**Accessibility:** Social links have aria-label.

---

#### MediaCardGrid (`src/components/shared/MediaCardGrid.tsx`)

**Purpose:** Generic media card grid (video/audio thumbnails).

**Variants:** 2-col, 3-col, 4-col (configurable via `columns` prop)

**States:** Default, Hover (play overlay), Empty (hidden)

---

#### PublicationGrid (`src/components/shared/PublicationGrid.tsx`)

**Purpose:** Publication cover cards with action overlays.

**States:** Default, Hover ("Read Online" / "Download" buttons appear)

---

#### CTABanner (`src/components/shared/CTABanner.tsx`)

**Purpose:** Full-width CTA with heading, subheading, button.

**Variants:** Configurable background color/image, button text/link.

---

#### EmbedBlock (`src/components/shared/EmbedBlock.tsx`)

**Purpose:** Responsive iframe embed (YouTube URL auto-conversion).

**Variants:** Aspect ratio: video (16:9), square (1:1), wide (21:9). Optional caption.

---

#### HubLanding (`src/components/shared/HubLanding.tsx`)

**Purpose:** Generic landing page with title, subtitle, and link cards grid.

**Used by:** /resources, /organization, /public-programs, /events, /online-courses, /join

---

#### ContactForm / ContactSection (`src/components/shared/ContactForm.tsx`, `ContactSection.tsx`)

**Purpose:** Contact form + info display.

**States:** Default (form visible), Submitting (loading spinner), Success (toast), Error (toast), Validation (inline errors)

**Fields:** Name, Email, Phone, Subject, Message

**Accessibility:** All inputs have labels, validation messages announced, form submission uses toast for feedback.

---

### UI Primitives (shadcn/ui)

All at `src/components/ui/`. Full set of 48+ components from shadcn/ui based on Radix primitives. Each includes:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Dark mode support
- Variant system (via `class-variance-authority`)

Key primitives used extensively: `Button`, `Input`, `Dialog`, `Sheet`, `Accordion`, `Tabs`, `Card`, `Separator`, `Skeleton`, `Breadcrumb`, `Select`, `Badge`, `Avatar`, `Tooltip`

---

### Audio Experience

#### PersistentAudioPlayer (`src/components/audio/PersistentAudioPlayer.tsx`)

**Purpose:** Global bottom-fixed audio player. Persists across page navigation.

**Anatomy:**
```
Sticky bottom bar: Collapse/Expand toggle
  Now Playing: Artwork (optional) | Title | Speaker
  Controls: Skip -10s | Play/Pause | Skip +10s
  Progress: Scrub bar | Current time | Duration
  Volume: Slider | Mute toggle
  Waveform: Animated bars (decorative)
```

**States:**
- Hidden: No audio selected
- Collapsed: Mini bar showing now-playing info
- Expanded: Full controls visible
- Playing: Waveform animated, play button shows pause icon
- Paused: Waveform paused, pause button shows play icon
- Loading: Buffering state
- Empty: "No audio selected" in collapsed state

**Accessibility:**
- All controls are keyboard accessible
- Sliders (progress, volume) use native `<input type="range">`
- Play/pause button has `aria-label` updates
- Current time and duration announced

**Design Tokens:** Dark teal background (`#0d5844` / `bg-primary`), gold accents (`#c8a84e`)

---

### Video Experience

- Embedded YouTube players via responsive iframes (`EmbedBlock`)
- Native `<video>` player for self-hosted content
- Play button overlays on thumbnail cards
- External channel links section on video listing page

---

### Document Experience

- Books and magazines are PDF documents
- Download flow: Direct file link via `fileUrl` field
- "Read Online" links to PDF in-browser
- Cover images displayed as previews (240×332px, 13:18 aspect ratio)

---

## Search Experience

**Entry point:** Header search bar (desktop inline, mobile modal via Sheet)

**Route:** `/search?q=...` (server component, `force-dynamic`)

**Scope:** Simultaneously searches 7 tables: `pages`, `posts`, `audio`, `videos`, `books`, `magazines`, `pressReleases`

**Results:**
- Max 10 results per content type
- Normalized format: id, title, description (HTML stripped, 160 chars), type, link, date
- Displayed as styled cards with type icon + color badge (Page, Article, Audio, Video, Book, Magazine, Press Release)
- Each result has date, title, description, "Explore" link

**States:**
- Initial (no query): Empty state — "Enter a search term to find content" message
- Loading: Server component, loading handled by Next.js streaming/Suspense
- Results found: Grouped result cards
- No results: "No results found for [query]. Suggestions: check spelling, try different keywords, browse categories"
- Error: Database query failure caught per-table, partial results shown

**Result link patterns:**
```
Pages:           /{slug}
Audio:           /resources/audios/{slug}
Videos:          /resources/videos/{slug}
Books:           /resources/books/{slug}
Magazines:       /resources/magazines/{slug}
Press Releases:  /press-releases/{slug}
Posts:           /resources
```

---

## Accessibility Standards

### Target Level: WCAG 2.2 AA

### Requirements Per Component Type

**Interactive elements (buttons, links, controls):**
- Minimum target size 24×24px (WCAG 2.5.8)
- Visible focus indicator (2px solid ring, 2px offset) on `:focus-visible`
- Keyboard operable: Enter/Space for buttons, Enter for links
- `aria-label` when visual label is insufficient
- `aria-expanded` / `aria-haspopup` for expandable controls

**Images:**
- Informative images: Descriptive `alt` text
- Decorative images/icons: `alt=""` or `aria-hidden="true"`
- Background images: CSS background-image (decorative)

**Forms:**
- All inputs have associated `<label>` or `aria-label`
- Validation errors announced via `aria-describedby` or toast
- Required fields indicated

**Navigation:**
- Skip-to-content link at top of every page
- Consistent navigation across pages
- Mega-dropdowns keyboard accessible with arrow key navigation
- Current page indicated in navigation (via `aria-current` where applicable)

**Dynamic content:**
- Auto-rotating carousels have pause mechanism (hover/focus)
- `aria-live="polite"` for content updates
- Status changes announced to screen readers

**Dialogs and modals:**
- Focus trapping within dialog when open
- Close on Escape key
- Focus returns to trigger element on close
- `aria-labelledby` referencing dialog title

**Color and contrast:**
- Text: minimum 4.5:1 contrast ratio
- Large text (18px+ bold or 24px+ regular): 3:1 minimum
- UI components and focus indicators: 3:1 minimum
- Color not used as sole means of conveying information

**Language and direction:**
- `<html lang="en">` for English content
- `lang="ur"` + `dir="rtl"` for Urdu content
- Arabic/Urdu fonts have proper font-family stacking

---

## Responsive Strategy

### Breakpoints Applied

| Screen | Strategy |
|--------|----------|
| Mobile (<640px) | Single column, hamburger nav, edge-to-edge containers, stacked layouts |
| Tablet (640-1023px) | 2-column grids, visible top bar, mega-menu converts to hamburger |
| Desktop (≥1024px) | Multi-column grids (3-4), full mega-menu, inline search, date bar |

### Per-Component Responsive Rules

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Header Top Bar | Hidden | Hidden | Visible |
| Header Nav | Sheet drawer | Sheet drawer | Inline mega-menu |
| Hero | Full width, small arrows | Full width, hidden arrows show on hover | Full width, 1351×374 ratio |
| Leader cards | Single column, stacked | 2 columns | 2 columns |
| Campaign grid | 1 column | 2 columns | 3 columns |
| Video grid | 1 column | 2 columns | 4 columns |
| Press releases | 1 column | 2 columns | 3 columns |
| Magazines/Books | 2 columns | 2 columns | 4 columns |
| Footer | 2 columns | 2 columns | 5 columns |
| Social CTA | 2×2 wrap | Row | Row |

### Container Behavior

```
Mobile:   Full-width (px-0)
sm+:      px-4 margins
All:      max-width 1240px, centered (mx-auto)
```

---

## SEO & Discoverability

### Metadata Pattern

Every page should implement `generateMetadata` exporting:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${pageTitle} | Tanzeem-e-Islami`,
    description: pageDescription,
    alternates: { canonical: url },
    robots: { index, follow },
    openGraph: { title, description, url, siteName, type, images },
  };
}
```

### Structured Data

The catch-all CMS page (`[...slug]/page.tsx`) supports:
- JSON-LD schema injection via `<!--SEO_METADATA_JSON:...-->` comment in content
- Schema types: `WebPage`, `Article`, `Organization`, `Person`
- Additional schemas: Added as needed per page type

### Sitemap

Dynamic sitemap at `/sitemap.xml` generated from:
- 57 static route entries with priorities and change frequencies
- All published pages from DB (`pages` table)
- All published audio, video, books, magazines
- Published press releases
- Published events

### URL Strategy

- Clean, descriptive slugs (`/organization/the-founder`)
- Resource URLs grouped by type (`/resources/audios/{slug}`)
- Consistent hierarchy (`/resources/magazines/{series}/{year}`)
- Canonical URLs enforced via metadata

---

## Performance Standards

### Image Optimization

- Use Next.js `<Image>` component where appropriate (requires configuration)
- External images use `next.config.ts` remote patterns
- Aspect ratio containers prevent layout shift (348:195 for cards, 13:18 for publications)
- `onError` handlers manage image load failures gracefully

### Route Loading

| Strategy | Routes |
|----------|--------|
| `force-dynamic` | Search, resource listings, catch-all CMS pages, homepage |
| Static (implicit) | Static pages with no DB dependencies |

### Component Architecture

| Type | Usage |
|------|-------|
| Server Components | Static content, data fetching, SEO metadata |
| Client Components | Interactivity (carousels, dialogs, forms, audio player, animations) |

### Caching Notes

- Dynamic routes re-fetch on every request (`force-dynamic`)
- Menu and settings fetched client-side via `/api` routes
- No ISR configured — requires project inspection for caching strategy enhancement

---

## Page Templates

### Template: Homepage (`/`)

**Purpose:** Organizational landing page with multiple content sections.

**Layout Structure:**
```
Hero (carousel slider)
AboutAndLeaders (mission + team)
SpotlightCampaigns (campaign cards)
MissionAndVideos (banner + video grid)
LatestPressReleases (press cards with dialog)
PublicationsGrid (magazines + books)
CTA (social media connect)
BackToTop
```

**Data sources:** `homeSliders`, `teamMembers`, `homeCampaigns`, `videos` (featured), `pressReleases` (latest 3), `books` (featured 4), `magazines` (featured 4), `settings` (homepage group)

**Dynamic:** Yes (`force-dynamic`)

**Accessibility:** Skip-to-content link → Main heading → Sequential focus through all sections.

---

### Template: Resource Listing (`/resources/{type}`)

**Purpose:** Browseable, filterable lists of media resources.

**Layout Structure:**
```
PageBanner
Search bar (for applicable types)
Filter controls (speaker, category selects)
Grid/list of items
Pagination (where needed)
```

**Variants:** Audio list, Video grid, Book grid, Magazine grid, Speaker grid

**Data sources:** Corresponding DB table with filter/sort params

**Dynamic:** Yes (`force-dynamic`)

---

### Template: Resource Detail (`/resources/{type}/{slug}`)

**Purpose:** Full detail view of a single resource.

**Layout Structure:**
```
PageBanner (with title)
Detail header (thumbnail, metadata)
Content area (description, player/viewer)
Actions (download, share)
Related items
```

**Variants:** Audio detail (with player), Video detail (with embed), Book detail (with download), Magazine detail (with download)

**Data sources:** Single record from corresponding DB table

---

### Template: CMS Page (`/{slug}`)

**Purpose:** Any page not matching a static route.

**Layout Structure:**
```
If sections exist:
  [Section 1: Hero/Intro/Stats/etc.]
  [Section 2: ...]
  [Section N: ...]
Else:
  PageBanner
  Title + Featured Image
  Content HTML
```

**Supported section types:** `hero`, `intro`, `stats`, `accordion`, `team`, `media_grid`, `publications`, `cta_banner`, `embed`

**Data sources:** `pages` table + `pageSections` (ordered, active)

**SEO:** Metadata extracted from content comment or meta fields

**Dynamic:** Yes (`force-dynamic`)

---

### Template: Event Detail (`/events/{slug}`)

**Purpose:** Single event information page.

**Layout Structure:**
```
PageBanner
Thumbnail (optional)
Date range + time
Location (in-person) / online link
Description + Content
Registration button (if required)
```

**Data sources:** `events` table

---

### Template: Search (`/search?q=...`)

**Purpose:** Cross-content search results.

**Layout Structure:**
```
Page title + search input (pre-filled)
Results grouped by type
Each result: Type badge | Date | Title | Description | Link
Empty state / No results state
```

**Data sources:** 7 DB tables queried via `LIKE`

**Dynamic:** Yes (`force-dynamic`)

---

### Template: Static Content Page

**Purpose:** Informational/utility pages.

**Layout Structure:**
```
PageBanner (with breadcrumbs)
Content area
Related links (optional)
```

**Examples:** `/contact`, `/faq`, `/policy`, `/privacy`, `/join`

**Data sources:** Hardcoded or CMS content

**Static:** Can be static when content is hardcoded.

---

## Admin Interface

### Route: `/sitemanager`

**Purpose:** Administrative content management.

**Features:**
- Authentication check via `/api/auth/me`
- Login form (`POST /api/auth/login`)
- Page management (CRUD via `/api/pages`)
- Settings management (via `/api/settings`)
- Media upload (via `/api/upload` and `/api/media`)
- User management (via `/api/users`)
- Menu management (via `/api/menus`)
- Dashboard stats (via `/api/admin/stats`)

**Sections managed via query param:** `?section=pages|settings|media|users|menus`

---

## Utility Pages

- **`/not-found`** (404): Custom page with "Go Home", "Contact Us", "Search Site" links
- **`/sitemap.xml`**: Auto-generated sitemap
- **Analytics**: Google Analytics (G-B6P9KW8X46) via next/script

---

*This design system is based on project inspection conducted 2026-06-08. Where specific values are marked as configurable, they are stored in the `settings` DB table and fetched via `/api/settings`.*
