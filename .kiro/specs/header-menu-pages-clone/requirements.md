# Requirements Document

## Introduction

This feature clones all header menu pages and sub-pages from www.tanzeem.org into the Next.js 16 App Router project. Every page must serve dynamic content from the MySQL database (via Drizzle ORM), matching the design language defined in `design.md`. The admin panel at `/sitemanager` must expose full CRUD management for every page type, including a new Sermons (Khitab-e-Jum'ah) manager. Existing pages that currently fall back to static hardcoded content must be upgraded to pull from the database, and missing pages (notably `/resources/khitab-e-jumah` and its detail view) must be built from scratch.

## Glossary

- **System**: The Next.js 16 App Router application at tanzeem--next
- **CMS_Page**: A record in the `pages` table, optionally composed of `page_sections`
- **DynamicPageContent**: The shared React component that renders `page_sections` from the database
- **getCmsPage(slug)**: Server-side helper that fetches a `pages` record and its associated `page_sections` by slug
- **Sermon**: A record in the `sermons` table representing a Friday sermon (Khitab-e-Jum'ah)
- **Admin_Panel**: The `/sitemanager` route and its React component tree
- **SermonsManager**: The new admin component for CRUD management of `sermons` records
- **HubLanding**: Shared component that renders a grid of navigation cards for hub/index pages
- **StaticFallback**: Hardcoded JSX rendered when no database record exists for a page slug
- **EARS**: Easy Approach to Requirements Syntax — the requirement pattern standard used throughout this document
- **Page_Type**: One of: CMS_Page (pages table), Sermon, Audio, Video, Book, Magazine, PressRelease, DarseQuranEvent
- **SermonsList**: The frontend page at `/resources/khitab-e-jumah` listing all published sermons
- **SermonDetail**: The frontend detail page at `/resources/khitab-e-jumah/[slug]` for a single sermon

---

## Requirements

### Requirement 1: Organization Section Pages — Dynamic Content

**User Story:** As a site visitor, I want to read the Organization section and all its sub-pages (Background, Mission Statement, Our Ideology and its four sub-pages, The Founder, The Ameer), so that I can learn about Tanzeem-e-Islami's history, mission, and leadership from accurate, up-to-date database content.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/organization`, THE System SHALL fetch the CMS_Page record with slug `organization` and render DynamicPageContent if page_sections exist, HTML content if only page content exists, or the HubLanding fallback if no database record exists.
2. WHEN a visitor navigates to `/organization/background`, THE System SHALL fetch the CMS_Page record with slug `organization/background` and render DynamicPageContent, HTML content, or a fallback page in that priority order.
3. WHEN a visitor navigates to `/organization/mission-statement`, THE System SHALL fetch the CMS_Page record with slug `organization/mission-statement` and render DynamicPageContent, HTML content, or a fallback page in that priority order.
4. WHEN a visitor navigates to `/organization/our-ideology`, THE System SHALL fetch the CMS_Page record with slug `organization/our-ideology` and render DynamicPageContent, HTML content, or a HubLanding fallback with cards linking to `/organization/our-ideology/basic-belief`, `/organization/our-ideology/our-obligations`, `/organization/our-ideology/methodology`, and `/organization/our-ideology/foundation`.
5. WHEN a visitor navigates to any of `/organization/our-ideology/basic-belief`, `/organization/our-ideology/our-obligations`, `/organization/our-ideology/methodology`, or `/organization/our-ideology/foundation`, THE System SHALL fetch the CMS_Page record matching that slug and render DynamicPageContent, HTML content, or a static fallback in that priority order.
6. WHEN a visitor navigates to `/organization/the-founder`, THE System SHALL fetch the CMS_Page record with slug `organization/the-founder` and render DynamicPageContent, HTML content, or a fallback in that priority order.
7. WHEN a visitor navigates to `/organization/the-ameer`, THE System SHALL fetch the CMS_Page record with slug `organization/the-ameer` and render DynamicPageContent, HTML content, or a fallback in that priority order.
8. THE System SHALL export a `generateMetadata` function for each organization page that uses the database `metaTitle` and `metaDescription` when available, falling back to a default string when not.

---

### Requirement 2: Education Section Pages — Dynamic Content

**User Story:** As a site visitor, I want to access the Education section pages (Ruju Ilal Quran, Distance Learning, Online Courses), so that I can discover Tanzeem-e-Islami's learning programs from current database content.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/ruju-ilal-quran`, THE System SHALL fetch the CMS_Page record with slug `ruju-ilal-quran` and render DynamicPageContent, HTML content, or a static fallback in that priority order.
2. WHEN a visitor navigates to `/distance-learning`, THE System SHALL fetch the CMS_Page record with slug `distance-learning` and render DynamicPageContent, HTML content, or a static fallback in that priority order.
3. WHEN a visitor navigates to `/online-courses`, THE System SHALL fetch the CMS_Page record with slug `online-courses` and render DynamicPageContent, HTML content, or a static fallback in that priority order.
4. THE System SHALL export a `generateMetadata` function for each education page that uses database `metaTitle` and `metaDescription` when available, falling back to a default string when not.

---

### Requirement 3: Resources Hub and Listing Pages — Dynamic Content

**User Story:** As a site visitor, I want to browse the Resources hub and all its sub-sections (Audios, Videos, Books, Magazines, Press Releases, Social Media, Khitab-e-Jum'ah, FAQ), so that I can find Islamic educational content from the live database.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/resources`, THE System SHALL render a HubLanding page with cards linking to all resource sub-sections: Audios, Videos, Books, Magazines, Press Releases, Social Media, Khitab-e-Jum'ah, and FAQ.
2. WHEN a visitor navigates to `/resources/audios/by-speaker`, THE System SHALL fetch all published Speakers from the database and render a SpeakerGrid component.
3. WHEN a visitor navigates to `/resources/audios/by-category`, THE System SHALL fetch all published Audio records grouped by AudioCategory and render an AudioList with category filter active.
4. WHEN a visitor navigates to `/resources/khitab-e-jumah`, THE System SHALL fetch all published Sermon records from the `sermons` table ordered by `sermon_date` descending and render a SermonsList component.
5. WHEN a visitor navigates to `/resources/khitab-e-jumah/[slug]`, THE System SHALL fetch the Sermon record matching `slug` from the `sermons` table, and render a SermonDetail component displaying the title, sermon date, speaker name, description, audio player (if `audioUrl` is set), and video embed (if `videoUrl` is set).
6. IF no Sermon record with the requested slug exists, THEN THE System SHALL return a Next.js `notFound()` response. IF a Sermon record with the requested slug exists but its `isPublished` field is false, THEN THE System SHALL also return a Next.js `notFound()` response.
7. WHEN a visitor navigates to `/resources/press-releases`, THE System SHALL fetch all published PressRelease records from the database ordered by `publishedAt` descending and render the LatestPressReleases component.
8. WHEN a visitor navigates to `/resources/social-media`, THE System SHALL redirect to `/social-media` where the SocialHub component renders platform and account data from the database.
9. THE System SHALL export a `generateMetadata` function for `/resources/khitab-e-jumah/[slug]` that uses the Sermon record's `metaTitle`, `metaDescription`, `title`, and `sermonDate` to produce accurate page metadata.

---

### Requirement 4: Khitab-e-Jum'ah Frontend Components

**User Story:** As a site visitor, I want to browse and play Friday sermons on a well-designed page that matches the site's design system, so that I can listen to or watch Khitab-e-Jum'ah recordings easily.

#### Acceptance Criteria

1. THE System SHALL render a SermonsList component that displays each published Sermon as a card showing: title, speaker name, sermon date formatted as a human-readable string, and a thumbnail image when `thumbnailUrl` is set.
2. WHEN `audioUrl` is set on a Sermon card, THE SermonsList SHALL display a play button that links to the SermonDetail page.
3. THE System SHALL render a SermonDetail component that displays the sermon's full metadata, a native HTML5 `<audio>` player when `audioUrl` is set, and a YouTube embed iframe when `videoUrl` is a YouTube URL.
4. WHEN the SermonsList has no published records, THE System SHALL display a message: "No sermons available yet. Please check back soon." The System SHALL show this message whenever there are no playable (published) sermons, even if unpublished sermon records exist in the database.
5. THE System SHALL render the SermonsList and SermonDetail components using design tokens from `design.md`: `--primary` for headings and accents, `--card` for card backgrounds, `--foreground-muted` for secondary text, and `py-14 md:py-16` vertical padding on page sections.

---

### Requirement 5: Quranic Circles and Contact Pages — Dynamic Content

**User Story:** As a site visitor, I want to access the Quranic Circles and Contact Us pages with live database content, so that I can find accurate program schedules and contact information.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/quranic-circles`, THE System SHALL fetch the CMS_Page record with slug `quranic-circles` and render DynamicPageContent, HTML content, or a static fallback in that priority order.
2. WHEN a visitor navigates to `/contact`, THE System SHALL fetch the CMS_Page record with slug `contact` and render DynamicPageContent, HTML content, or the ContactSection component fallback in that priority order.
3. THE System SHALL export a `generateMetadata` function for each of these pages using database metadata when available.

---

### Requirement 6: Admin CRUD — Sermons Manager

**User Story:** As an admin, I want to create, read, update, and delete Friday sermon records in the admin panel, so that I can keep the Khitab-e-Jum'ah archive up to date without editing code.

#### Acceptance Criteria

1. THE Admin_Panel SHALL include a "Sermons" entry in the sidebar navigation under the "Content" group, linking to `?section=sermons`.
2. WHEN an admin navigates to `?section=sermons`, THE Admin_Panel SHALL display a list of all Sermon records showing title, speaker name, sermon date, and published status.
3. WHEN an admin clicks "Add New" on the sermons list, THE Admin_Panel SHALL open a form with fields: title (required), slug (required, auto-generated from title), description (rich text), speaker name, sermon date (date picker), audio URL, video URL, thumbnail URL, published status toggle.
4. WHEN an admin fills the sermon form and clicks Save, THE Admin_Panel SHALL POST to `/api/admin/sermons` and on success refresh the sermons list and dismiss the form. WHEN a save operation result is determined, THE Admin_Panel SHALL show a success or error toast immediately.
5. WHEN an admin clicks Edit on an existing sermon, THE Admin_Panel SHALL load that sermon's data into the form and PUT to `/api/admin/sermons/[id]` on save.
6. WHEN an admin clicks Delete on a sermon and confirms the dialog, THE Admin_Panel SHALL DELETE `/api/admin/sermons/[id]` and on success remove the sermon from the list.
7. IF the `/api/admin/sermons` POST request is missing the `title` or `slug` fields, THEN THE System SHALL return a 400 response with an error message listing only the missing fields. Validation errors for other fields such as invalid date formats or malformed URLs SHALL NOT produce a 400 response from this endpoint.
8. IF an admin submits a sermon with a `slug` that already exists in the `sermons` table, THEN THE System SHALL return a 409 response with the error "A sermon with this slug already exists".

---

### Requirement 7: Admin CRUD — Sermons API Routes

**User Story:** As the system, I need REST API endpoints for sermon CRUD operations, so that the admin panel can manage sermon records reliably.

#### Acceptance Criteria

1. THE System SHALL expose a `GET /api/admin/sermons` endpoint that returns all Sermon records ordered by `sermon_date` descending, accessible only to authenticated admin users.
2. THE System SHALL expose a `POST /api/admin/sermons` endpoint that inserts a new Sermon record, generates a UUID for `id`, validates required fields (`title`, `slug`), and returns `{ success: true, id }` on success.
3. THE System SHALL expose a `PUT /api/admin/sermons/[id]` endpoint that updates an existing Sermon record and returns `{ success: true }` on success.
4. THE System SHALL expose a `DELETE /api/admin/sermons/[id]` endpoint that deletes the Sermon record with the given `id` and returns `{ success: true }` on success.
5. IF any sermons API endpoint is called without a valid session, THEN THE System SHALL return a 401 response with `{ error: "Unauthorized" }` and SHALL block all database operations, ensuring no data is read, inserted, updated, or deleted without proper authentication.
6. IF `DELETE /api/admin/sermons/[id]` is called with an `id` that does not exist, THEN THE System SHALL return a 404 response with `{ error: "Not found" }`.

---

### Requirement 8: Admin Sidebar — Complete Content Coverage

**User Story:** As an admin, I want the sidebar navigation to include all manageable content types so that I can access every section without knowing its URL manually.

#### Acceptance Criteria

1. THE Admin_Panel sidebar SHALL include a "Sermons" link under the "Content" group pointing to `?section=sermons`.
2. THE Admin_Panel sidebar SHALL include an "Events" link under the "Programs" group pointing to `?section=events`.
3. THE Admin_Panel sidebar SHALL include a "Dars-e-Quran" link under the "Programs" group pointing to `?section=darse-quran`.
4. THE Admin_Panel sidebar SHALL include a "Social Media" link under the "Content" group pointing to `?section=social-media`.
5. THE Admin_Panel sidebar SHALL include a "Homepage" link at the top level pointing to `?section=homepage`.
6. WHEN any sidebar link is the active section, THE Admin_Panel SHALL highlight that link with the `bg-primary text-primary-foreground` style to indicate the current section.

---

### Requirement 9: Admin Panel — SermonsManager Component

**User Story:** As an admin, I want a dedicated Sermons management component in the admin panel that follows the same UX patterns as other content managers, so that managing sermons feels consistent and intuitive.

#### Acceptance Criteria

1. THE Admin_Panel SHALL render the SermonsManager component when `section === "sermons"`.
2. THE SermonsManager SHALL display a page header with title "Sermons (Khitab-e-Jum'ah)" and an "Add New" button.
3. THE SermonsManager SHALL render a ContentList-style table with columns: Title, Speaker, Date, Status.
4. WHEN the SermonsManager is in "edit" or "new" state, THE SermonsManager SHALL render a ContentEditor form with all required sermon fields. IF the form fails to render due to a component error or missing data, THE SermonsManager SHALL revert to the default list view and display an error message.
5. THE SermonsManager SHALL display a ConfirmDialog before executing any delete operation.
6. WHEN a save or delete operation request completes with a success HTTP status, THE SermonsManager SHALL display a success toast notification immediately.
7. WHEN a save or delete operation returns an error HTTP status, THE SermonsManager SHALL display a destructive error toast notification with the error message immediately.

---

### Requirement 10: Admin Panel — Entity Route Coverage

**User Story:** As an admin, I want the generic admin entity API to support sermon management so that the existing CRUD infrastructure can be reused with minimal new code.

#### Acceptance Criteria

1. THE System SHALL add `sermons` to the `entityMap` in `/api/admin/[entity]/route.ts` mapping to the `sermons` database table.
2. THE System SHALL add `sermons` required fields `["title", "slug"]` to the `REQUIRED_FIELDS` map in `/api/admin/[entity]/route.ts`.
3. THE System SHALL add a `GET /api/admin/[entity]/[id]` and `PUT /api/admin/[entity]/[id]` and `DELETE /api/admin/[entity]/[id]` route at `/api/admin/[entity]/[id]/route.ts` to handle individual record operations for all entities including sermons.
4. WHEN the generic entity route handles a `PUT` request, THE System SHALL merge the request body fields onto the existing record and update `updatedAt` automatically via the Drizzle `onUpdateNow()` column definition.
5. IF the `PUT` or `DELETE` route receives an `id` that does not exist in the target table, THEN THE System SHALL return a 404 response with `{ error: "Not found" }`. GET requests for a non-existent `id` SHALL return an empty result rather than a 404.

---

### Requirement 11: Frontend Page SEO and Metadata

**User Story:** As a site operator, I want every header menu page to export accurate Next.js metadata, so that search engines and social media crawlers receive correct titles and descriptions.

#### Acceptance Criteria

1. THE System SHALL export a `generateMetadata` async function from every route file in the header menu hierarchy. THE System SHALL always export this function regardless of whether database metadata is available. When database metadata is available, THE function SHALL return `metaTitle` and `metaDescription` from the database record. When the database has no record, THE function SHALL return the default values.
2. WHEN the database has no record for a page slug, THE System SHALL use a default title in the format `"[Page Name] | Tanzeem-e-Islami"` and a default description describing the page's content.
3. THE System SHALL include Open Graph `og:title` and `og:description` tags in all page metadata, derived from the same database fields used for the canonical title and description.
4. WHEN a Sermon detail page is rendered, THE System SHALL set `og:title` to the sermon's title and `og:image` to `thumbnailUrl` when available.

---

### Requirement 12: Database Seed Data — Khitab-e-Jum'ah

**User Story:** As a developer deploying the site, I want seed data for at least 3 representative sermon records in the `sermons` table, so that the Khitab-e-Jum'ah page displays real content immediately after setup.

#### Acceptance Criteria

1. THE System SHALL include at minimum 3 Sermon records in the database seed script with realistic titles, slugs, speaker names, sermon dates, and `isPublished = true`.
2. THE seed data SHALL include at least one Sermon record with a non-null `audioUrl` to validate the audio player rendering.
3. THE seed data SHALL include at least one Sermon record with a non-null `videoUrl` pointing to a YouTube URL to validate the embed rendering. Other Sermon records MAY use non-YouTube video sources such as Vimeo or direct MP4 links.
4. WHEN the seed script is executed, THE System SHALL not fail if the sermon records already exist (idempotent insert using slug uniqueness check or upsert).
