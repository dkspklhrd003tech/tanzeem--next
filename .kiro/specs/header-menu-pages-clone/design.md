# Design Document — Header Menu Pages Clone

## Overview

This design covers cloning all header menu pages from www.tanzeem.org into the Next.js 16 App Router project with fully dynamic DB-driven content, plus the CRUD admin panel extensions needed to manage all page types. It builds on the existing patterns in the codebase — the `getCmsPage()` / `DynamicPageContent` / `StaticFallback` three-tier rendering model and the `ContentList` + `ContentEditor` admin UX — and adds only what is missing.

---

## Architecture

### Three-Tier Page Rendering Pattern

Every frontend page follows the same cascading render logic already established in the codebase:

```
1. DB has page record + active page_sections  →  <DynamicPageContent sections={sections} />
2. DB has page record, no sections            →  raw HTML via dangerouslySetInnerHTML
3. No DB record / unpublished                 →  <StaticFallback /> (hardcoded JSX)
```

All pages also export `generateMetadata()` that resolves: `page.metaTitle` → `page.title` → default string.

### Sermon Content Flow

```
sermons table
    ↓
GET /api/admin/sermons  (admin CRUD)
PUT /api/admin/sermons/[id]
DELETE /api/admin/sermons/[id]
    ↓
SermonsManager (admin UI)
    ↓
/resources/khitab-e-jumah  →  SermonsList component
/resources/khitab-e-jumah/[slug]  →  SermonDetail component
```

### Generic Entity Route Extension

The existing `/api/admin/[entity]/route.ts` handles GET (list) and POST (create). A new sibling file `/api/admin/[entity]/[id]/route.ts` handles GET (single), PUT (update), DELETE (delete) for all entities including `sermons`.

---

## Component Design

### New Frontend Components

#### `SermonsList` — `src/components/resources/SermonsList.tsx`

**Props:**
```ts
interface SermonsListProps {
  sermons: SermonRecord[];
}
```

**Layout:**
```
<section aria-labelledby="sermons-heading" className="py-14 md:py-16">
  <div className="container mx-auto">
    <h1 id="sermons-heading" className="font-amiri text-3xl md:text-4xl text-primary font-bold mb-8">
      Khitab-e-Jum'ah
    </h1>

    {sermons.length === 0}
      → <p>No sermons available yet. Please check back soon.</p>

    {sermons.length > 0}
      → 3-col responsive grid of SermonCard components
```

**SermonCard anatomy:**
```
<article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all">
  Thumbnail (16:9 ratio, placeholder icon if null)
  <div className="p-5">
    <p className="text-xs text-foreground-muted">  {sermonDate formatted as "dd MMM yyyy"}  </p>
    <h2 className="text-lg font-bold text-foreground group-hover:text-primary mt-1">{title}</h2>
    <p className="text-sm text-foreground-muted mt-1">{speakerName}</p>
    {audioUrl && <Link href="/resources/khitab-e-jumah/[slug]" aria-label="Play sermon">
      <PlayCircle className="h-8 w-8 text-primary" />
    </Link>}
  </div>
</article>
```

**Empty state:**
```
<div className="col-span-3 py-16 text-center text-foreground-muted">
  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
  <p>No sermons available yet. Please check back soon.</p>
</div>
```

---

#### `SermonDetail` — `src/components/resources/SermonDetail.tsx`

**Props:**
```ts
interface SermonDetailProps {
  sermon: SermonRecord;
}
```

**Layout:**
```
<article className="container mx-auto py-14 md:py-16 max-w-4xl">
  <header>
    <p className="text-sm text-foreground-muted">{sermonDate}</p>
    <h1 className="font-amiri text-3xl md:text-4xl text-primary font-bold mt-2">{title}</h1>
    <p className="text-foreground-muted mt-1">{speakerName}</p>
  </header>

  {thumbnailUrl && <img src={thumbnailUrl} alt={title} className="w-full rounded-lg mt-6 aspect-video object-cover" />}

  {audioUrl && (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-3">Audio</h2>
      <audio controls src={audioUrl} className="w-full" aria-label={`Audio: ${title}`} />
    </div>
  )}

  {videoUrl is YouTube && (
    <div className="mt-8 aspect-video">
      <iframe src={youtubeEmbedUrl} title={title} allowFullScreen className="w-full h-full rounded-lg" />
    </div>
  )}

  {description && (
    <div className="prose prose-lg dark:prose-invert max-w-none mt-8"
      dangerouslySetInnerHTML={{ __html: description }} />
  )}
</article>
```

**YouTube detection:** `videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')`

**YouTube embed URL transform:**
- `watch?v=ID` → `https://www.youtube.com/embed/ID`
- `youtu.be/ID` → `https://www.youtube.com/embed/ID`

---

### New Admin Component

#### `SermonsManager` — `src/components/admin/SermonsManager.tsx`

Follows the same pattern as `DarseQuranManager`. Uses inline modal form instead of delegating to `ContentEditor` (to keep full control of sermon-specific fields).

**State:**
```ts
type ViewState = "list" | "new" | "edit";

const [view, setView] = useState<ViewState>("list");
const [sermons, setSermons] = useState<SermonRecord[]>([]);
const [editingId, setEditingId] = useState<string | null>(null);
const [deletingId, setDeletingId] = useState<string | null>(null);
const [formData, setFormData] = useState<SermonFormData>(defaultFormData);
const [isLoading, setIsLoading] = useState(true);
const { toast } = useToast();
```

**Form fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | text input | yes | triggers slug auto-generation |
| `slug` | text input | yes | auto-generated: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-\|-$/g, '')` |
| `speakerName` | text input | no | |
| `sermonDate` | date input `type="date"` | no | |
| `description` | RichTextEditor | no | |
| `audioUrl` | text input | no | |
| `videoUrl` | text input | no | |
| `thumbnailUrl` | text input + ImageUploader | no | |
| `isPublished` | checkbox / Switch | no | default true |

**API calls:**
```
Fetch list:  GET  /api/admin/sermons
Create:      POST /api/admin/sermons
Update:      PUT  /api/admin/sermons/[id]
Delete:      DEL  /api/admin/sermons/[id]
```

**List table columns:** Title | Speaker | Date | Status | Actions (Edit, Delete)

**Error handling:** All fetch errors caught and displayed via `toast({ variant: "destructive", ... })`. Success also shown via `toast({ title: "Success", ... })`.

**Delete flow:** Click Delete → `ConfirmDialog` opens → confirm → `DELETE /api/admin/sermons/[id]` → refresh list.

---

## Page Route Design

### Organization Pages (all existing, verified pattern)

| Route file | Slug | DB key | Fallback |
|-----------|------|--------|---------|
| `src/app/organization/page.tsx` | `organization` | `organization` | `HubLanding` with 5 sub-page cards |
| `src/app/organization/background/page.tsx` | `organization/background` | `organization/background` | Static article + `CTABanner` |
| `src/app/organization/mission-statement/page.tsx` | `organization/mission-statement` | `organization/mission-statement` | Static article + `CTABanner` |
| `src/app/organization/our-ideology/page.tsx` | `organization/our-ideology` | `organization/our-ideology` | `HubLanding` with 4 ideology cards |
| `src/app/organization/our-ideology/basic-belief/page.tsx` | `organization/our-ideology/basic-belief` | `organization/our-ideology/basic-belief` | Static article |
| `src/app/organization/our-ideology/our-obligations/page.tsx` | `organization/our-ideology/our-obligations` | `organization/our-ideology/our-obligations` | Static article |
| `src/app/organization/our-ideology/methodology/page.tsx` | `organization/our-ideology/methodology` | `organization/our-ideology/methodology` | Static article |
| `src/app/organization/our-ideology/foundation/page.tsx` | `organization/our-ideology/foundation` | `organization/our-ideology/foundation` | Static article |
| `src/app/organization/the-founder/page.tsx` | `organization/the-founder` | `organization/the-founder` | Static bio + `CTABanner` |
| `src/app/organization/the-ameer/page.tsx` | `organization/the-ameer` | `organization/the-ameer` | Static bio + `CTABanner` |

All pages use `getCmsPage(SLUG)` and follow the 3-tier rendering pattern. All export `generateMetadata()`.

### Education Pages (all existing, verified pattern)

| Route file | Slug | Fallback |
|-----------|------|---------|
| `src/app/ruju-ilal-quran/page.tsx` | `ruju-ilal-quran` | Static article about Ruju Ilal Quran program |
| `src/app/distance-learning/page.tsx` | `distance-learning` | Static article about distance learning |
| `src/app/online-courses/page.tsx` | `online-courses` | Static article about online courses + external link |

### Resources Pages

#### `/resources/page.tsx` — Hub

Renders `HubLanding` with 8 cards:
```ts
const RESOURCE_CARDS = [
  { title: "Audios", href: "/resources/audios", description: "..." },
  { title: "Videos", href: "/resources/videos", description: "..." },
  { title: "Books", href: "/resources/books", description: "..." },
  { title: "Magazines", href: "/resources/magazines", description: "..." },
  { title: "Press Releases", href: "/press-releases", description: "..." },
  { title: "Social Media", href: "/resources/social-media", description: "..." },
  { title: "Khitab-e-Jum'ah", href: "/resources/khitab-e-jumah", description: "..." },
  { title: "FAQ", href: "/faq", description: "..." },
];
```

#### New: `/resources/khitab-e-jumah/page.tsx`

```ts
// Server component
import { db } from "@/db";
import { sermons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SermonsList } from "@/components/resources/SermonsList";

export async function generateMetadata() {
  return {
    title: "Khitab-e-Jum'ah | Tanzeem-e-Islami",
    description: "Friday sermons (Khitab-e-Jum'ah) by Tanzeem-e-Islami leaders.",
    openGraph: { title: "Khitab-e-Jum'ah | Tanzeem-e-Islami", ... },
  };
}

export default async function KhitabEJumahPage() {
  const data = await db.select().from(sermons)
    .where(eq(sermons.isPublished, true))
    .orderBy(desc(sermons.sermonDate));
  return (
    <main className="min-h-screen bg-background">
      <SermonsList sermons={data} />
    </main>
  );
}
```

#### New: `/resources/khitab-e-jumah/[slug]/page.tsx`

```ts
// Server component
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const sermon = await db.query.sermons.findFirst({ where: eq(sermons.slug, slug) });
  if (!sermon || !sermon.isPublished) return { title: "Not Found" };
  return {
    title: sermon.metaTitle || sermon.title,
    description: sermon.metaDescription,
    openGraph: {
      title: sermon.title,
      description: sermon.metaDescription,
      images: sermon.thumbnailUrl ? [{ url: sermon.thumbnailUrl }] : [],
    },
  };
}

export default async function SermonDetailPage({ params }) {
  const { slug } = await params;
  const sermon = await db.query.sermons.findFirst({ where: eq(sermons.slug, slug) });
  if (!sermon || !sermon.isPublished) notFound();
  return (
    <main className="min-h-screen bg-background">
      <SermonDetail sermon={sermon} />
    </main>
  );
}
```

#### `/press-releases/page.tsx`

Fetches from `pressReleases` table ordered by `publishedAt` desc. Reuses `LatestPressReleases` component (already exists).

#### `/resources/social-media/page.tsx`

Renders `<redirect>` to `/social-media` via `redirect()` from `next/navigation`.

### Quranic Circles and Contact (existing, already correct pattern)

Both `src/app/quranic-circles/page.tsx` and `src/app/contact/page.tsx` already implement the 3-tier pattern correctly. No changes needed unless static fallback content needs updating.

---

## API Route Design

### `/api/admin/[entity]/route.ts` — Changes

Add to `entityMap`:
```ts
sermons,      // maps to sermons table from schema
```

Add to `REQUIRED_FIELDS`:
```ts
sermons: ["title", "slug"],
```

### New: `/api/admin/[entity]/[id]/route.ts`

Handles GET (single record), PUT (update), DELETE (delete) for all entities.

```ts
export async function GET(request, { params }) {
  // requireAuth → select from table where id = params.id → return item or {}
}

export async function PUT(request, { params }) {
  // requireAuth → validate entity → select existing record
  // if not found → 404
  // merge request.json() onto existing, db.update().set(data).where(eq(table.id, id))
  // returns { success: true }
}

export async function DELETE(request, { params }) {
  // requireAuth → validate entity → select existing record
  // if not found → 404 { error: "Not found" }
  // db.delete(table).where(eq(table.id, id))
  // returns { success: true }
}
```

**PUT merge strategy:** Spread request body fields only — Drizzle's `onUpdateNow()` on `updatedAt` handles the timestamp automatically, so no manual timestamp injection is needed.

**404 check:** For PUT and DELETE, do a `db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1)` before mutation. If `result.length === 0` return 404.

---

## Admin Panel Changes

### `AdminLayout.tsx` — Sidebar menu additions

Add to `menuItems` array:

**Under "Content" group items:**
```ts
{ title: "Sermons", icon: Mic2, href: "/sitemanager?section=sermons" },
{ title: "Social Media", icon: Share2, href: "/sitemanager?section=social-media" },
```

**Under "Programs" group items (rename existing + add):**
```ts
{ title: "Events", icon: Calendar, href: "/sitemanager?section=events" },
{ title: "Dars-e-Quran", icon: BookOpen, href: "/sitemanager?section=darse-quran" },
```

**Top-level (before "Content"):**
```ts
{ title: "Homepage", icon: Home, href: "/sitemanager?section=homepage" },
```

The `SidebarMenuItem` component already auto-expands parent groups when a child section is active (lines using `useEffect` + `setIsOpen(true)`). Active state highlighting uses `bg-primary text-primary-foreground` class, already implemented on the `isActive` condition.

### `AdminPages.tsx` — Section handler additions

Add to `isGenericSection` array:
```ts
"sermons",
```

Add sermon columns when `section === "sermons"`:
```ts
if (section === "sermons") columns = [
  { key: "title", header: "Title" },
  { key: "speakerName", header: "Speaker" },
  { key: "sermonDate", header: "Date", render: (item) => item.sermonDate ? new Date(item.sermonDate).toLocaleDateString() : "—" },
];
```

Add dedicated render for `section === "sermons"`:
```ts
if (section === "sermons") {
  return <SermonsManager />;
}
```

This renders `SermonsManager` which owns its own fetch/state. No dependency on the shared `data` / `editingId` state.

---

## Database Seed

### File: `scripts/seed-sermons.ts`

Idempotent script that checks slug existence before inserting.

```ts
const SERMON_SEEDS = [
  {
    id: crypto.randomUUID(),
    title: "Iqamat-e-Deen — Hamari Zimmedari",
    slug: "iqamat-e-deen-hamari-zimmedari",
    speakerName: "Shujauddin Sheikh",
    sermonDate: new Date("2025-01-03"),
    audioUrl: "https://tanzeem.org/audio/khitab-2025-01-03.mp3",
    videoUrl: null,
    thumbnailUrl: null,
    description: "<p>Friday sermon on the obligation of establishing Deen.</p>",
    isPublished: true,
  },
  {
    id: crypto.randomUUID(),
    title: "Quran Aur Hamara Taluq",
    slug: "quran-aur-hamara-taluq",
    speakerName: "Shujauddin Sheikh",
    sermonDate: new Date("2025-01-10"),
    audioUrl: null,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "<p>Friday sermon on our relationship with the Quran.</p>",
    isPublished: true,
  },
  {
    id: crypto.randomUUID(),
    title: "Sabr Aur Shukr — Islamic Perspective",
    slug: "sabr-aur-shukr-islamic-perspective",
    speakerName: "Dr. Israr Ahmed",
    sermonDate: new Date("2010-04-02"),
    audioUrl: "https://tanzeem.org/audio/dr-israr-sabr-shukr.mp3",
    videoUrl: "https://www.youtube.com/watch?v=abc123example",
    thumbnailUrl: null,
    description: "<p>Classic sermon by Dr. Israr Ahmed on patience and gratitude.</p>",
    isPublished: true,
  },
];
```

Idempotency check:
```ts
for (const sermon of SERMON_SEEDS) {
  const existing = await db.select({ id: sermons.id })
    .from(sermons)
    .where(eq(sermons.slug, sermon.slug))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(sermons).values(sermon);
    console.log(`Inserted: ${sermon.slug}`);
  } else {
    console.log(`Skipped (exists): ${sermon.slug}`);
  }
}
```

---

## File Change Summary

### New files
| File | Purpose |
|------|---------|
| `src/app/resources/khitab-e-jumah/page.tsx` | SermonsList page |
| `src/app/resources/khitab-e-jumah/[slug]/page.tsx` | SermonDetail page |
| `src/app/press-releases/page.tsx` | Press releases listing |
| `src/app/resources/social-media/page.tsx` | Redirect to /social-media |
| `src/components/resources/SermonsList.tsx` | Sermons grid component |
| `src/components/resources/SermonDetail.tsx` | Sermon detail component |
| `src/components/admin/SermonsManager.tsx` | Admin CRUD for sermons |
| `src/app/api/admin/[entity]/[id]/route.ts` | GET/PUT/DELETE for all entities |
| `scripts/seed-sermons.ts` | Idempotent sermon seed data |

### Modified files
| File | Change |
|------|--------|
| `src/app/api/admin/[entity]/route.ts` | Add `sermons` to entityMap + REQUIRED_FIELDS |
| `src/components/admin/AdminLayout.tsx` | Add Sermons, Events, Dars-e-Quran, Social Media, Homepage to sidebar |
| `src/components/admin/AdminPages.tsx` | Add `sermons` to isGenericSection + render `<SermonsManager />` |
| `src/app/resources/page.tsx` | Update HubLanding cards to include Khitab-e-Jum'ah |
| Ideology sub-pages (4 files) | Verify/add static fallback content if missing |

### Unchanged files (already correct)
- All organization page routes (already implement 3-tier pattern)
- `/src/app/contact/page.tsx`
- `/src/app/quranic-circles/page.tsx`
- `/src/lib/page-helpers.ts`
- `/src/components/shared/DynamicPageContent.tsx`
- `/src/components/shared/HubLanding.tsx`

---

## Design Token Usage

All new components follow the token conventions from `design.md`:

| Token | Usage in new components |
|-------|------------------------|
| `text-primary` | Headings, active links, play button |
| `bg-card` | Sermon card background |
| `border-border` | Card borders |
| `text-foreground-muted` | Speaker name, date caption |
| `py-14 md:py-16` | Page section vertical padding |
| `hover:shadow-md hover:-translate-y-1` | Card hover lift |
| `font-amiri` | Page headings (Khitab-e-Jum'ah h1) |
| `text-foreground` | Body text |

---

## Error Handling

### Frontend pages
- `notFound()` called when sermon slug not found or `isPublished === false`
- Image `onError` → hide `<img>` or show placeholder icon
- DB fetch errors in server components → let Next.js error boundary handle (no user-visible stack traces)

### API routes
- Missing required fields → 400 with field list
- Duplicate slug → 409
- Not found (PUT/DELETE) → 404 `{ error: "Not found" }`
- Unauthenticated → 401 `{ error: "Unauthorized" }`, no DB call made
- Unexpected DB error → 500 `{ error: "Internal server error" }`

### Admin UI
- All API errors caught in try/catch → `toast({ variant: "destructive", ... })`
- Success → `toast({ title: "Success", ... })`
- Loading states shown via `isLoading` boolean and skeleton/spinner
