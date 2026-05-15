import {
    mysqlTable,
    varchar,
    text,
    int,
    boolean,
    timestamp,
    json,
} from "drizzle-orm/mysql-core";
import { relations } from 'drizzle-orm';

const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
};

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
    template: varchar("template", { length: 50 }).default("default").notNull(),
    parentId: varchar("parent_id", { length: 191 }),
    order: int("order").default(0).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    showInMenu: boolean("show_in_menu").default(false).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
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
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    playCount: int("play_count").default(0).notNull(),
    downloadCount: int("download_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
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
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
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
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    order: int("order").default(0).notNull(),
    viewCount: int("view_count").default(0).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
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
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    description: text("description"),
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
    isPublished: boolean("is_published").default(true).notNull(),
    publishedAt: timestamp("published_at"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
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
    address: text("address"),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 191 }),
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


