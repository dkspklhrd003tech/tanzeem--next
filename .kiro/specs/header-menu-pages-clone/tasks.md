# Implementation Plan: Header Menu Pages Clone

## Overview

This plan implements the remaining work to fully clone all header menu pages from www.tanzeem.org. The codebase already has the 3-tier rendering pattern working for most pages, `[entity]/[id]/route.ts` for generic CRUD, and a catch-all `/resources/[...slug]` handler. The work focuses on: (1) adding `sermons` to both API entity routes, (2) building the `SermonsList` and `SermonDetail` frontend components backed by the `sermons` table, (3) replacing the catch-all khitab-e-jumah handler with dedicated page routes, (4) wiring the new `SermonsManager` into the admin panel sidebar and section routing, (5) adding the `/resources/press-releases` and `/resources/social-media` dedicated routes, (6) updating the `/resources` hub card list, and (7) adding seed data. All organization, education, contact, and quranic-circles pages already implement the correct 3-tier pattern and need no changes.

---

## Tasks

- [x] 1. Extend API entity routes to support sermons
  - [x] 1.1 Add `sermons` to entityMap and REQUIRED_FIELDS in `/api/admin/[entity]/route.ts`
    - Import `sermons` from `@/db/schema` alongside the existing imports
    - Add `sermons` key to `entityMap` pointing to the `sermons` table
    - Add `sermons: ["title", "slug"]` to the `REQUIRED_FIELDS` map
    - _Requirements: 10.1, 10.2, 7.2_
  - [x] 1.2 Add `sermons` to entityMap in `/api/admin/[entity]/[id]/route.ts`
    - Import `sermons` from `@/db/schema` in the `[id]` route file (the file already exists with GET/PUT/DELETE handlers)
    - Add `sermons` to the `entityMap` in that file so PUT/DELETE resolve the correct table
    - GET for non-existent id should return 404 consistent with current behaviour
    - _Requirements: 10.3, 10.4, 10.5, 7.3, 7.4, 7.5, 7.6_

- [x] 2. Build `SermonsList` frontend component
  - [x] 2.1 Create `src/components/resources/SermonsList.tsx`
    - Accept `sermons: SermonRecord[]` prop (use `typeof sermons.$inferSelect` from schema or an equivalent inline interface)
    - Render a 3-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) of sermon cards
    - Each card: `<article>` with `bg-card border border-border rounded-lg` classes, 16:9 thumbnail (placeholder `MessageSquare` icon when null), `sermonDate` formatted as `"dd MMM yyyy"` via `toLocaleDateString`, title, speaker name, and a `PlayCircle` link to `/resources/khitab-e-jumah/[slug]` when `audioUrl` is set
    - Empty state: centered `MessageSquare` icon + "No sermons available yet. Please check back soon."
    - Use design tokens: `text-primary` headings, `bg-card` cards, `text-foreground-muted` secondary text, `py-14 md:py-16` section padding, `font-amiri` page h1
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 3. Build `SermonDetail` frontend component
  - [x] 3.1 Create `src/components/resources/SermonDetail.tsx`
    - Accept `sermon: SermonRecord` prop
    - Render: page heading with `font-amiri text-3xl md:text-4xl text-primary`, date (`text-sm text-foreground-muted`), speaker name, optional thumbnail `<img>` (aspect-video, rounded-lg), optional `<audio controls>` player when `audioUrl` is set, YouTube `<iframe>` embed when `videoUrl` contains `youtube.com` or `youtu.be` (transform `watch?v=ID` and `youtu.be/ID` to `https://www.youtube.com/embed/ID`), rich description via `dangerouslySetInnerHTML`
    - Container: `container mx-auto py-14 md:py-16 max-w-4xl`
    - _Requirements: 4.3, 4.5_

- [x] 4. Create Khitab-e-Jum'ah listing page route
  - [x] 4.1 Create `src/app/resources/khitab-e-jumah/page.tsx`
    - Server component; query `db.select().from(sermons).where(eq(sermons.isPublished, true)).orderBy(desc(sermons.sermonDate))`
    - Import and render `<SermonsList sermons={data} />`
    - Export `generateMetadata()` returning `title: "Khitab-e-Jum'ah | Tanzeem-e-Islami"` and `description`
    - This dedicated route takes priority over the catch-all `/resources/[...slug]` for `khitab-e-jumah`; remove or guard the fallback in the catch-all if Next.js routing doesn't automatically shadow it
    - _Requirements: 3.4, 11.1, 11.2_
  - [x] 4.2 Create `src/app/resources/khitab-e-jumah/[slug]/page.tsx`
    - Server component; query `db.query.sermons.findFirst({ where: eq(sermons.slug, slug) })`
    - Call `notFound()` if record is missing or `isPublished === false`
    - Import and render `<SermonDetail sermon={sermon} />`
    - Export `generateMetadata({ params })` using `sermon.metaTitle || sermon.title`, `sermon.metaDescription`, and Open Graph `og:title` + `og:image` from `thumbnailUrl`
    - _Requirements: 3.5, 3.6, 3.9, 11.1, 11.3, 11.4_

- [x] 5. Create `/resources/press-releases` dedicated route
  - [x] 5.1 Create `src/app/press-releases/page.tsx`
    - Server component; fetch `db.select().from(pressReleases).where(eq(pressReleases.isPublished, true)).orderBy(desc(pressReleases.publishedAt)).limit(30)`
    - Render using the existing `LatestPressReleases` component imported from `@/components/home/LatestPressReleases`
    - Export static `metadata` with title `"Press Releases | Tanzeem-e-Islami"`
    - Note: The catch-all `/resources/[...slug]` already handles this path; creating a dedicated route file makes it the canonical handler — confirm the catch-all's `press-releases` branch still handles detail slugs at `/press-releases/[slug]`
    - _Requirements: 3.7, 11.1_

- [x] 6. Create `/resources/social-media` redirect route
  - [x] 6.1 Create `src/app/resources/social-media/page.tsx`
    - Call `redirect("/social-media")` from `next/navigation` — one-liner server component
    - The catch-all already does this redirect; the dedicated route removes the dependency on the catch-all for this path
    - _Requirements: 3.8_

- [x] 7. Update `/resources` hub landing cards
  - [x] 7.1 Modify `src/app/resources/page.tsx`
    - Update the `cards` array to include an 8th entry: `{ title: "FAQ", href: "/faq", description: "Frequently asked questions" }`
    - The existing 7 cards already include Khitab-e-Jum'ah, Press Releases, and Social Media — verify all hrefs match the routes created in tasks 4–6 and requirement 3.1
    - _Requirements: 3.1_

- [~] 8. Checkpoint — API and frontend routes
  - Ensure the application builds without TypeScript errors: `npx tsc --noEmit`
  - Verify the sermons entity routes return correct responses by checking imports compile
  - Ensure all new page route files export a default component and `generateMetadata`

- [x] 9. Build `SermonsManager` admin component
  - [x] 9.1 Create `src/components/admin/SermonsManager.tsx`
    - Follow the `DarseQuranManager` pattern: `"use client"` directive, local `ViewState` type, `useState` for list/loading/form/editingId/deletingId, `useToast` for feedback
    - Form fields: `title` (text, required, triggers slug auto-generation), `slug` (text, required, auto-generated via `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`), `speakerName` (text), `sermonDate` (`type="date"`), `description` (RichTextEditor), `audioUrl` (text), `videoUrl` (text), `thumbnailUrl` (text + ImageUploader), `isPublished` (checkbox, default true)
    - API calls: `GET /api/admin/sermons` for list; `POST /api/admin/sermons` for create; `PUT /api/admin/sermons/[id]` for update; `DELETE /api/admin/sermons/[id]` for delete
    - List table columns: Title | Speaker | Date | Status | Actions (Edit, Delete)
    - Delete flow: `ConfirmDialog` → `DELETE` → refresh list
    - All errors caught in try/catch → `toast({ variant: "destructive" })`; success → `toast({ title: "Success" })`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 6.3, 6.4, 6.5, 6.6_

- [ ] 10. Wire `SermonsManager` into `AdminPages.tsx`
  - [-] 10.1 Modify `src/components/admin/AdminPages.tsx`
    - Add `import { SermonsManager } from "./SermonsManager"` at the top
    - Add `"sermons"` to the `isGenericSection` array so `fetchGenericData` fires on mount
    - Add the `section === "sermons"` column mapping: `[{ key: "title", header: "Title" }, { key: "speakerName", header: "Speaker" }, { key: "sermonDate", header: "Date", render: (item) => item.sermonDate ? new Date(item.sermonDate).toLocaleDateString() : "—" }]`
    - Add a dedicated render branch before the generic `isGenericSection` block: `if (section === "sermons") { return <SermonsManager />; }` — so it renders the full custom component rather than the generic `ContentList`
    - _Requirements: 9.1, 6.2_

- [ ] 11. Update `AdminLayout.tsx` sidebar navigation
  - [ ] 11.1 Modify `src/components/admin/AdminLayout.tsx`
    - Import `Mic2, Share2, Home` from `lucide-react` (alongside the existing imports; `Calendar` and `BookOpen` already imported)
    - Add a top-level `{ title: "Homepage", icon: Home, href: "/sitemanager?section=homepage" }` item before the "Pages" entry
    - Under the "Content" group `items` array, add after "Press Releases": `{ title: "Sermons", icon: Mic2, href: "/sitemanager?section=sermons" }` and `{ title: "Social Media", icon: Share2, href: "/sitemanager?section=social-media" }`
    - Under the "Programs" group `items` array, add `{ title: "Events", icon: Calendar, href: "/sitemanager?section=events" }` and rename/verify the Dars-e-Quran entry exists as `{ title: "Dars-e-Quran", icon: BookOpen, href: "/sitemanager?section=darse-quran" }`
    - Active state highlighting already works via the existing `isActive` / `bg-primary text-primary-foreground` logic — no change needed
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 6.1_

- [x] 12. Create sermon seed data script
  - [x] 12.1 Create `scripts/seed-sermons.ts`
    - Define 3 `SERMON_SEEDS` records with realistic Urdu/English titles, slugs, speaker names (`Shujauddin Sheikh` and `Dr. Israr Ahmed`), sermon dates, and `isPublished: true`
    - Seed 1: audio-only (non-null `audioUrl`, null `videoUrl`)
    - Seed 2: YouTube video (non-null `videoUrl` with `https://www.youtube.com/watch?v=...`, auto-generated `thumbnailUrl` from `img.youtube.com/vi/...`)
    - Seed 3: both audio and YouTube video
    - Idempotency: for each record, check `db.select({ id: sermons.id }).from(sermons).where(eq(sermons.slug, sermon.slug)).limit(1)` — insert only if `existing.length === 0`, log `Skipped (exists): ${slug}` otherwise
    - Follow the pattern in existing `scripts/seed-organization.ts` for db import and script runner
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 13. Verification of existing pages
  - [x] 13.1 Audit organization section page routes
    - Confirm all 10 routes exist and use `getCmsPage(SLUG)` + 3-tier rendering: `/organization`, `/organization/background`, `/organization/mission-statement`, `/organization/our-ideology`, `/organization/our-ideology/basic-belief`, `/organization/our-ideology/our-obligations`, `/organization/our-ideology/methodology`, `/organization/our-ideology/foundation`, `/organization/the-founder`, `/organization/the-ameer`
    - Confirm each exports `generateMetadata()` calling `generatePageMetadata(page, DEFAULT_TITLE)`
    - All 10 routes are already implemented correctly — add missing `the-founder` and `the-ameer` routes if their directories don't have `page.tsx`
    - _Requirements: 1.1–1.8_
  - [x] 13.2 Audit education section page routes
    - Confirm `/ruju-ilal-quran`, `/distance-learning`, `/online-courses` all exist with 3-tier rendering and `generateMetadata()`
    - _Requirements: 2.1–2.4_
  - [x] 13.3 Audit quranic-circles and contact page routes
    - Confirm `/quranic-circles` and `/contact` exist with `getCmsPage` + `generateMetadata()`
    - _Requirements: 5.1–5.3_

- [~] 14. Final checkpoint — build and type check
  - Run `npx tsc --noEmit` and resolve any TypeScript errors
  - Ensure all new files import only from existing modules (no missing dependencies)
  - Verify `SermonsManager` is exported from `src/components/admin/index.ts` if that barrel file is used
  - Ensure all tasks pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (none in this plan — all tasks are required core implementation)
- The `[entity]/[id]/route.ts` already exists with GET/PUT/DELETE handlers; task 1.2 is a minimal edit (one import + one map entry)
- The catch-all `/resources/[...slug]/page.tsx` already handles `press-releases`, `social-media`, and `khitab-e-jumah` paths. Creating dedicated route files (tasks 4–6) lets Next.js route them directly without touching the catch-all's other branches.
- All 4 ideology sub-pages (`basic-belief`, `our-obligations`, `methodology`, `foundation`) already have correct 3-tier pattern implementations — task 13.1 is an audit-only confirmation step.
- The `sermons` table already exists in `src/db/schema.ts` — no migration is needed.
- `SocialMediaManager` is already wired in `AdminPages.tsx` for `section === "social-media"` — sidebar task 11.1 only needs to add the nav link entry.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "13.1", "13.2", "13.3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1", "6.1", "7.1", "12.1"] },
    { "id": 2, "tasks": ["4.1", "4.2", "9.1"] },
    { "id": 3, "tasks": ["10.1", "11.1"] }
  ]
}
```
