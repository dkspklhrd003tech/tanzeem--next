import {
    mysqlTable,
    varchar,
    text,
    int,
    boolean,
    timestamp,
    json,
    customType,
} from "drizzle-orm/mysql-core";
import { relations } from 'drizzle-orm';

const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
};

const longblob = customType<{ data: Buffer; driverData: Buffer }>({
    dataType() {
        return "longblob";
    },
    toDriver(value: Buffer) {
        return value;
    },
    fromDriver(value: Buffer) {
        return value;
    },
});

// ============================================
// USER & AUTHENTICATION
// ============================================

export const users = mysqlTable("users", {
    id: varchar("id", { length: 191 }).primaryKey(),
    email: varchar("email", { length: 191 }).notNull().unique(),
    name: varchar("name", { length: 191 }),
    password: text("password").notNull(),
    role: varchar("role", { length: 50 }).default("editor").notNull(),
    avatar: text("avatar"),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
    pages: many(pages),
    posts: many(posts),
    audioFiles: many(audio),
    videos: many(videos),
    books: many(books),
    magazines: many(magazines),
    events: many(events),
    activityLogs: many(activityLogs),
}));

export const activityLogs = mysqlTable("activity_logs", {
    id: varchar("id", { length: 191 }).primaryKey(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    action: varchar("action", { length: 191 }).notNull(),
    entityType: varchar("entity_type", { length: 191 }).notNull(),
    entityId: varchar("entity_id", { length: 191 }),
    details: text("details"),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

// ============================================
// NAVIGATION & MENUS
// ============================================

export const menuItems = mysqlTable("menu_items", {
    id: varchar("id", { length: 191 }).primaryKey(),
    label: varchar("label", { length: 191 }).notNull(),
    url: text("url"),
    parentId: varchar("parent_id", { length: 191 }),
    order: int("order").default(0).notNull(),
    isOpenInNew: boolean("is_open_in_new").default(false).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    menuType: varchar("menu_type", { length: 50 }).default("main").notNull(),
    ...timestamps,
});

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
    parent: one(menuItems, { fields: [menuItems.parentId], references: [menuItems.id], relationName: "MenuHierarchy" }),
    children: many(menuItems, { relationName: "MenuHierarchy" }),
}));

// ============================================
// PAGES
// ============================================

export const pages = mysqlTable("pages", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    featuredImageAlt: text("featured_image_alt"),
    template: varchar("template", { length: 50 }).default("default").notNull(),
    parentId: varchar("parent_id", { length: 191 }),
    order: int("order").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    showInMenu: boolean("show_in_menu").default(false).notNull(),
    // ── Core SEO ──────────────────────────────────────────────────────────────
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    // ── Extended SEO (Phase 6) ────────────────────────────────────────────────
    canonicalUrl: text("canonical_url"),
    ogImage: text("og_image"),
    schemaType: varchar("schema_type", { length: 100 }).default("WebPage"),
    noIndex: boolean("no_index").default(false).notNull(),
    seoData: json("seo_data"),
    // ── Authorship / publishing ───────────────────────────────────────────────
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const pagesRelations = relations(pages, ({ one, many }) => ({
    author: one(users, { fields: [pages.authorId], references: [users.id] }),
    parent: one(pages, { fields: [pages.parentId], references: [pages.id], relationName: "PageHierarchy" }),
    children: many(pages, { relationName: "PageHierarchy" }),
    sections: many(pageSections),
}));

export const pageSections = mysqlTable("page_sections", {
    id: varchar("id", { length: 191 }).primaryKey(),
    pageId: varchar("page_id", { length: 191 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 'hero', 'carousel', 'grid', 'text', 'media'
    order: int("order").default(0).notNull(),
    config: json("config").notNull(), // Stores section-specific data/styles
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

export const pageSectionsRelations = relations(pageSections, ({ one }) => ({
    page: one(pages, { fields: [pageSections.pageId], references: [pages.id] }),
}));

// ============================================
// POSTS / ARTICLES
// ============================================

export const posts = mysqlTable("posts", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    featuredImageAlt: text("featured_image_alt"),
    categoryId: varchar("category_id", { length: 191 }),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    viewCount: int("view_count").default(0).notNull(),
    tags: text("tags"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, { fields: [posts.authorId], references: [users.id] }),
    category: one(postCategories, { fields: [posts.categoryId], references: [postCategories.id] }),
}));

export const postCategories = mysqlTable("post_categories", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    ...timestamps,
});

export const postCategoriesRelations = relations(postCategories, ({ many }) => ({
    posts: many(posts),
}));

// ============================================
// AUDIO
// ============================================

export const audio = mysqlTable("audio", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    audioUrl: text("audio_url").notNull(),
    duration: int("duration"),
    fileSize: int("file_size"),
    thumbnailUrl: text("thumbnail_url"),
    categoryId: varchar("category_id", { length: 191 }),
    speakerId: varchar("speaker_id", { length: 191 }),
    code: varchar("code", { length: 50 }),
    tags: text("tags"),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    playCount: int("play_count").default(0).notNull(),
    downloadCount: int("download_count").default(0).notNull(),
    isNew: boolean("is_new").default(false).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    customFields: json("custom_fields"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const audioRelations = relations(audio, ({ one }) => ({
    author: one(users, { fields: [audio.authorId], references: [users.id] }),
    category: one(audioCategories, { fields: [audio.categoryId], references: [audioCategories.id] }),
    speaker: one(speakers, { fields: [audio.speakerId], references: [speakers.id] }),
}));

export const audioCategories = mysqlTable("audio_categories", {
    id: varchar("id", { length: 191 }).primaryKey(),
    parentId: varchar("parent_id", { length: 191 }),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    code: varchar("code", { length: 50 }),
    description: text("description"),
    imageUrl: text("image_url"),
    customFields: json("custom_fields"),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

export const audioCategoriesRelations = relations(audioCategories, ({ many }) => ({
    audioFiles: many(audio),
}));

// ============================================
// VIDEOS
// ============================================

export const videos = mysqlTable("videos", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    videoUrl: text("video_url").notNull(),
    embedUrl: text("embed_url"),
    thumbnailUrl: text("thumbnail_url"),
    duration: int("duration"),
    categoryId: varchar("category_id", { length: 191 }),
    speakerId: varchar("speaker_id", { length: 191 }),
    episodeNumber: varchar("episode_number", { length: 50 }),
    eventLocation: varchar("event_location", { length: 255 }),
    tags: text("tags"),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    viewCount: int("view_count").default(0).notNull(),
    isNew: boolean("is_new").default(false).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    customFields: json("custom_fields"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const videosRelations = relations(videos, ({ one }) => ({
    author: one(users, { fields: [videos.authorId], references: [users.id] }),
    category: one(videoCategories, { fields: [videos.categoryId], references: [videoCategories.id] }),
    speaker: one(speakers, { fields: [videos.speakerId], references: [speakers.id] }),
}));

export const videoCategories = mysqlTable("video_categories", {
    id: varchar("id", { length: 191 }).primaryKey(),
    parentId: varchar("parent_id", { length: 191 }),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    code: varchar("code", { length: 50 }),
    description: text("description"),
    imageUrl: text("image_url"),
    customFields: json("custom_fields"),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

export const videoCategoriesRelations = relations(videoCategories, ({ many }) => ({
    videos: many(videos),
}));

// ============================================
// HOME SLIDERS (HERO)
// ============================================

export const homeSliders = mysqlTable("home_sliders", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    imageUrl: text("image_url").notNull(),
    linkUrl: text("link_url"),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

// ============================================
// HOME CAMPAIGNS (SPOTLIGHT)
// ============================================

export const homeCampaigns = mysqlTable("home_campaigns", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    imageUrl: text("image_url").notNull(),
    linkUrl: text("link_url"),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

// ============================================
// SPEAKERS
// ============================================

export const speakers = mysqlTable("speakers", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    bio: text("bio"),
    avatar: text("avatar"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    seoData: json("seo_data"),
    customFields: json("custom_fields"),
    order: int("order").default(0).notNull(),
    ...timestamps,
});

export const speakersRelations = relations(speakers, ({ many }) => ({
    audioFiles: many(audio),
    videos: many(videos),
}));

// ============================================
// BOOKS
// ============================================

export const books = mysqlTable("books", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    coverImage: text("cover_image"),
    fileUrl: text("file_url"),
    fileSize: int("file_size"),
    pages: int("pages"),
    language: varchar("language", { length: 50 }).default("urdu").notNull(),
    categoryId: varchar("category_id", { length: 191 }),
    authorName: varchar("author_name", { length: 191 }),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    downloadCount: int("download_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const booksRelations = relations(books, ({ one }) => ({
    author: one(users, { fields: [books.authorId], references: [users.id] }),
    category: one(bookCategories, { fields: [books.categoryId], references: [bookCategories.id] }),
}));

export const bookCategories = mysqlTable("book_categories", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    coverImage: text("cover_image"),
    order: int("order").default(0).notNull(),
    ...timestamps,
});

export const bookCategoriesRelations = relations(bookCategories, ({ many }) => ({
    books: many(books),
}));

// ============================================
// MAGAZINES
// ============================================

export const magazines = mysqlTable("magazines", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    coverImage: text("cover_image"),
    fileUrl: text("file_url"),
    fileSize: int("file_size"),
    issueNumber: varchar("issue_number", { length: 100 }),
    publishDate: timestamp("publish_date"),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    downloadCount: int("download_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    ...timestamps,
});

export const magazinesRelations = relations(magazines, ({ one }) => ({
    author: one(users, { fields: [magazines.authorId], references: [users.id] }),
}));

// ============================================
// EVENTS
// ============================================

export const events = mysqlTable("events", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    content: text("content"),
    thumbnailUrl: text("thumbnail_url"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    location: varchar("location", { length: 255 }),
    address: text("address"),
    isOnline: boolean("is_online").default(false).notNull(),
    onlineUrl: text("online_url"),
    isPublished: boolean("is_published").default(true).notNull(),
    registrationRequired: boolean("registration_required").default(false).notNull(),
    registrationUrl: text("registration_url"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    ...timestamps,
});

export const eventsRelations = relations(events, ({ one }) => ({
    author: one(users, { fields: [events.authorId], references: [users.id] }),
}));

// ============================================
// TEAM MEMBERS
// ============================================

export const teamMembers = mysqlTable("team_members", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    designation: varchar("designation", { length: 191 }),
    bio: text("bio"),
    avatar: text("avatar"),
    email: varchar("email", { length: 191 }),
    phone: varchar("phone", { length: 50 }),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

// ============================================
// TESTIMONIALS
// ============================================

export const testimonials = mysqlTable("testimonials", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    designation: varchar("designation", { length: 191 }),
    company: varchar("company", { length: 191 }),
    avatar: text("avatar"),
    content: text("content").notNull(),
    rating: int("rating").default(5).notNull(),
    isApproved: boolean("is_approved").default(true).notNull(),
    order: int("order").default(0).notNull(),
    ...timestamps,
});

// ============================================
// SERVICES
// ============================================

export const services = mysqlTable("services", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    content: text("content"),
    icon: varchar("icon", { length: 100 }),
    imageUrl: text("image_url"),
    order: int("order").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    ...timestamps,
});

// ============================================
// SERMONS
// ============================================

export const sermons = mysqlTable("sermons", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    audioUrl: text("audio_url"),
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    duration: int("duration"),
    sermonDate: timestamp("sermon_date"),
    speakerName: varchar("speaker_name", { length: 191 }),
    isPublished: boolean("is_published").default(true).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    ...timestamps,
});

// ============================================
// PRESS RELEASES
// ============================================

export const pressReleases = mysqlTable("press_releases", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    featuredImageAlt: text("featured_image_alt"),
    pdfUrl: text("pdf_url"),
    isPublished: boolean("is_published").default(true).notNull(),
    publishedAt: timestamp("published_at"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    orderIndex: int("order_index").default(0).notNull(),
    ...timestamps,
});

// ============================================
// AUDIO BOOKS
// ============================================

export const audioBooks = mysqlTable("audio_books", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    featuredImage: text("featured_image"),
    featuredImageAlt: text("featured_image_alt"),
    audioUrl: text("audio_url"),
    isPublished: boolean("is_published").default(true).notNull(),
    publishedAt: timestamp("published_at"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    orderIndex: int("order_index").default(0).notNull(),
    ...timestamps,
});

// ============================================
// FORM SUBMISSIONS
// ============================================

export const formSubmissions = mysqlTable("form_submissions", {
    id: varchar("id", { length: 191 }).primaryKey(),
    formType: varchar("form_type", { length: 100 }).notNull(),
    name: varchar("name", { length: 191 }),
    email: varchar("email", { length: 191 }),
    phone: varchar("phone", { length: 50 }),
    subject: varchar("subject", { length: 255 }),
    message: text("message"),
    isRead: boolean("is_read").default(false).notNull(),
    isReplied: boolean("is_replied").default(false).notNull(),
    repliedAt: timestamp("replied_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// MEDIA LIBRARY
// ============================================

export const media = mysqlTable("media", {
    id: varchar("id", { length: 191 }).primaryKey(),
    filename: varchar("filename", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: int("size").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    altText: varchar("alt_text", { length: 255 }),
    caption: text("caption"),
    fileData: longblob("file_data"),
    uploadedBy: varchar("uploaded_by", { length: 191 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SITE SETTINGS
// ============================================

export const settings = mysqlTable("settings", {
    id: varchar("id", { length: 191 }).primaryKey(),
    key: varchar("key", { length: 191 }).notNull().unique(),
    value: text("value").notNull(),
    type: varchar("type", { length: 50 }).default("text").notNull(),
    group: varchar("group", { length: 50 }).default("general").notNull(),
    ...timestamps,
});

// ============================================
// LOCATIONS
// ============================================

export const locations = mysqlTable("locations", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    address: text("address"), // Legacy
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    phone: varchar("phone", { length: 50 }), // Legacy
    email: varchar("email", { length: 191 }), // Legacy
    details: json("details"), // Array of { title, address, phone, email, mapUrl }
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

// ============================================
// PLAYLISTS
// ============================================

export const playlists = mysqlTable("playlists", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    type: varchar("type", { length: 50 }).default("video").notNull(), // video, audio
    itemIds: text("item_ids"), // Comma-separated IDs
    isPublished: boolean("is_published").default(true).notNull(),
    order: int("order").default(0).notNull(),
    ...timestamps,
});

// ============================================
// DARSE-QURAN EVENTS
// ============================================

export const darseQuranEvents = mysqlTable("darse_quran_events", {
    id: varchar("id", { length: 191 }).primaryKey(),
    city: varchar("city", { length: 255 }).notNull(),
    time: varchar("time", { length: 255 }).notNull(),
    address: text("address").notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    hasLadiesArrangement: boolean("has_ladies_arrangement").default(false).notNull(),
    mudarris: varchar("mudarris", { length: 255 }).notNull(),
    contact: varchar("contact", { length: 100 }),
    isPublished: boolean("is_published").default(true).notNull(),
    ...timestamps,
});

// ============================================
// SOCIAL MEDIA HUB
// ============================================

export const socialPlatforms = mysqlTable("social_platforms", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    anchorTag: varchar("anchor_tag", { length: 50 }),
    iconUrl: text("icon_url"),
    themeColor: varchar("theme_color", { length: 50 }),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

export const socialAccounts = mysqlTable("social_accounts", {
    id: varchar("id", { length: 191 }).primaryKey(),
    platformId: varchar("platform_id", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    url: text("url").notNull(),
    imageUrl: text("image_url"),
    buttonText: varchar("button_text", { length: 50 }).default("Follow").notNull(),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});

export const socialPlatformsRelations = relations(socialPlatforms, ({ many }) => ({
    accounts: many(socialAccounts),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
    platform: one(socialPlatforms, { fields: [socialAccounts.platformId], references: [socialPlatforms.id] }),
}));

// ============================================
// FAQ ITEMS
// ============================================

export const faqItems = mysqlTable("faq_items", {
    id: varchar("id", { length: 191 }).primaryKey(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    category: varchar("category", { length: 100 }).default("general").notNull(),
    order: int("order").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    ...timestamps,
});

// ============================================
// DOWNLOADS
// ============================================

export const downloadCategories = mysqlTable("download_categories", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    order: int("order").default(0).notNull(),
    ...timestamps,
});

export const downloads = mysqlTable("downloads", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    fileUrl: text("file_url").notNull(),
    fileSize: int("file_size"),
    fileType: varchar("file_type", { length: 50 }),   // pdf, doc, zip …
    thumbnailUrl: text("thumbnail_url"),
    categoryId: varchar("category_id", { length: 191 }),
    language: varchar("language", { length: 50 }).default("urdu").notNull(),
    downloadCount: int("download_count").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const downloadsRelations = relations(downloads, ({ one }) => ({
    category: one(downloadCategories, {
        fields: [downloads.categoryId],
        references: [downloadCategories.id],
    }),
    author: one(users, { fields: [downloads.authorId], references: [users.id] }),
}));

export const downloadCategoriesRelations = relations(downloadCategories, ({ many }) => ({
    downloads: many(downloads),
}));

// ============================================
// GALLERIES
// ============================================

export const galleries = mysqlTable("galleries", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    coverImage: text("cover_image"),
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    publishedAt: timestamp("published_at"),
    ...timestamps,
});

export const galleryItems = mysqlTable("gallery_items", {
    id: varchar("id", { length: 191 }).primaryKey(),
    galleryId: varchar("gallery_id", { length: 191 }).notNull(),
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    caption: text("caption"),
    altText: varchar("alt_text", { length: 255 }),
    order: int("order").default(0).notNull(),
    ...timestamps,
});

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
    author: one(users, { fields: [galleries.authorId], references: [users.id] }),
    items: many(galleryItems),
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
    gallery: one(galleries, { fields: [galleryItems.galleryId], references: [galleries.id] }),
}));

// ============================================
// DONATION CAMPAIGNS
// ============================================

export const donationCampaigns = mysqlTable("donation_campaigns", {
    id: varchar("id", { length: 191 }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
    content: text("content"),
    coverImage: text("cover_image"),
    goalAmount: int("goal_amount"),          // in PKR/USD (smallest currency unit)
    raisedAmount: int("raised_amount").default(0).notNull(),
    currency: varchar("currency", { length: 10 }).default("PKR").notNull(),
    donationUrl: text("donation_url"),       // external payment link
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    authorId: varchar("author_id", { length: 191 }).notNull(),
    ...timestamps,
});

export const donationCampaignsRelations = relations(donationCampaigns, ({ one }) => ({
    author: one(users, { fields: [donationCampaigns.authorId], references: [users.id] }),
}));

// ============================================
// KHITABAT-E-JUMMAH ADDRESSES
// ============================================

export const khitabatJummahAddresses = mysqlTable("khitabat_e_jummah_addresses", {
    id: varchar("id", { length: 191 }).primaryKey(),
    masjid: varchar("masjid", { length: 255 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    time: varchar("time", { length: 255 }).notNull(),
    contact: varchar("contact", { length: 100 }),
    map: text("map"),
    isPublished: boolean("is_published").default(true).notNull(),
    ...timestamps,
});




// ============================================
// CUSTOM FIELD DEFINITIONS (DYNAMIC FIELDS)
// ============================================

export const customFieldDefinitions = mysqlTable("custom_field_definitions", {
    id: varchar("id", { length: 191 }).primaryKey(),
    entityType: varchar("entity_type", { length: 100 }).notNull(), // 'speaker', 'audio', 'video', 'audio_category', 'video_category'
    label: varchar("label", { length: 255 }).notNull(),
    fieldKey: varchar("field_key", { length: 191 }).notNull(),
    fieldType: varchar("field_type", { length: 50 }).notNull(), // 'text', 'textarea', 'number', 'url', 'date', 'toggle', 'select', 'file'
    options: json("options"), // Array of strings or {label, value} if type is 'select'
    isRequired: boolean("is_required").default(false).notNull(),
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    orderIndex: int("order_index").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
});
