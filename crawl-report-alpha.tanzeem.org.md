# Crawl Report — alpha.tanzeem.org

**Date:** 2026-06-02
**Pages crawled:** 60
**Internal links checked:** ~450+

---

## Executive Summary

The alpha.tanzeem.org site (WordPress/Elementor staging) is **~90% healthy**. Of 60 pages crawled, **54 load successfully (200 OK)** and **6 return 404**. No redirect chains were detected. The `/services/` section is the primary problem area with 67% broken links. Two pages have broken image references pointing to `beta.tanzeem.org` (a non-existent subdomain). All other sections (Organization, Resources, Education, Magazines, Videos, Audio, Books) are fully functional with consistent navigation and content.

---

## Results Overview

| Metric | Count | % |
|--------|-------|---|
| Total pages crawled | 60 | 100% |
| Loaded successfully (200) | 54 | 90% |
| Broken (404) | 6 | 10% |
| Redirects observed | 0 | 0% |
| Pages with broken images | 2 | 3.3% |

---

## Broken Links (6 pages — all under `/services/`)

| # | URL | Issue |
|---|-----|-------|
| 1 | `/services/our-foundation/` | 404 Not Found |
| 2 | `/services/our-belief/` | 404 Not Found |
| 3 | `/services/hurmat-e-masjid-e-aqsa-press-conference/` | 404 Not Found |
| 4 | `/services/insdad-e-sood-muhim/` | 404 Not Found |
| 5 | `/services/ithade-ummat-aur-pakistan-ki-salmiat/` | 404 Not Found |
| 6 | `/services/quran-forum-toba/` | 404 Not Found |

These 6 pages are **linked from the Organization landing page** as card links ("Our Foundation", "Our Belief", "Our Methodology" etc.). Only `/services/methodology/` and `/services/aazadi-e-palestine/` work.

---

## Pages with Broken Images

| Page | Broken Image URL |
|------|-----------------|
| `/organization/the-founder/` | `https://beta.tanzeem.org/wp-content/uploads/2024/02/bani.png` |
| `/organization/` | `https://beta.tanzeem.org/wp-content/uploads/2024/02/bani1.png` |

The images are hardcoded to `beta.tanzeem.org` in both the HTML `<img>` tags and the RankMath JSON-LD schema. `beta.tanzeem.org` does not serve these assets.

---

## All Loaded Pages (54 successful)

### Organization (7 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/` | Tanzeem-e-Islami Home | ✅ 200 |
| `/organization/` | Organization | ✅ 200 |
| `/organization/background-2/` | Background | ✅ 200 |
| `/organization/mission-statement/` | Mission Statement | ✅ 200 |
| `/organization/our-ideology/` | Our Ideology | ✅ 200 |
| `/organization/our-ideology/basic-belief/` | Basic Belief | ✅ 200 |
| `/organization/our-ideology/foundation/` | Foundation | ✅ 200 |
| `/organization/our-ideology/methodology/` | Our Methodology | ✅ 200 |
| `/organization/our-ideology/our-obligations/` | Our Obligations | ✅ 200 |
| `/organization/the-founder/` | The Founder | ✅ 200 |
| `/organization/the-ameer/` | The Ameer | ✅ 200 |

### Education (3 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/markaz-tanzeem/` | Ruju Ilal Quran | ✅ 200 |
| `/distance-learning/` | Distance Learning | ✅ 200 |
| `/quranic-circles/` | Quranic Circles | ✅ 200 |

### Audio (4 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/audio-2/` | Audio | ✅ 200 |
| `/audios/audios-by-category/` | Audios by Category | ✅ 200 |
| `/audios/audios-by-category-2/` | Audios by Speaker | ✅ 200 |
| `/audio-books/` | Audio Books | ✅ 200 |
| `/audio/2025-08-22-phattay-barastay-badil-selab-aur-degar-aafat/` | (audio page) | ✅ 200 |

### Video (6 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/videos/` | Videos | ✅ 200 |
| `/videos-by-category/` | Videos by Category | ✅ 200 |
| `/videos-by-speakers/` | Videos by Speakers | ✅ 200 |
| `/videos/2025-07-18-social-media-par-tauheen-e-risalat-o-muqadsat-case/` | ...Case | ✅ 200 |
| `/videos/ep-352-2024-guzar-gia-hum-nay-kia-sabaq-sekha/` | Ep #352 | ✅ 200 |
| `/videos/ep-42-ameer-say-mulaqat-august-2025/` | Ep #42 | ✅ 200 |
| `/videos/ep-475-greater-isrel-netanyahu-ka-rohani-ya-shetani-mission/` | Ep #475 | ✅ 200 |

### Books (4 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/books/` | Books | ✅ 200 |
| `/books-by-category/` | Books by Category | ✅ 200 |
| `/books_author-dr-israr-ahmed/by-authors/` | Books By Authors | ✅ 200 |
| `/books/01-musalmano-per-quran-majeed-kay-huqooq/` | 01-01 : MUSALMANO PER QURAN MAJEED KAY HUQOOQ | ✅ 200 |

### Magazines (5 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/magazines/` | Magazines | ✅ 200 |
| `/meesaq/` | Category: Meesaq | ✅ 200 |
| `/hikmat-e-quran/` | Category: Hikmat-e-Quran | ✅ 200 |
| `/nida-e-khilafat/` | Category: Nida-e-Khilafat | ✅ 200 |
| `/perspective/` | Category: Perspective | ✅ 200 |
| `/magazines/16-perspective-16-to-31-august-2025/` | 16 PERSPECTIVE - 16 To 31 August 2025 | ✅ 200 |

### Category Archives (4 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/category-audio-code-001-dars-e-quran/` | Category: Audio Code 001 \| Dars-e-Quran | ✅ 200 |
| `/category-audio-code-002-mutfariq-khutbat-e-jumah/` | Category: Audio Code 002 \| Mutfariq Khutbat-e-Jumah | ✅ 200 |
| `/category-bayan-ul-quran-hindi/` | Category: Bayan-ul-Quran Hindi | ✅ 200 |
| `/category-sunnat-o-seerat/` | Category: Sunnat-o-Seerat | ✅ 200 |
| `/category-asaan-arabi-grammar/` | Category: Asaan Arabi Grammar | ✅ 200 |
| `/quran-e-hakeem-aur-hamari-zindagi-2/` | Category: Quran-e-Hakeem aur Hamari Zindagi | ✅ 200 |

### Standalone Pages (6 pages)
| URL | Title | Status |
|-----|-------|--------|
| `/contact-us/` | Contact Us | ✅ 200 |
| `/faq/` | FAQ | ✅ 200 |
| `/policy/` | Policy | ✅ 200 |
| `/press-releases/` | Press Releases | ✅ 200 |
| `/social-media/` | Social Media | ✅ 200 |
| `/history-of-tanzeem-e-islami/` | History of Tanzeem-e-Islami | ✅ 200 |
| `/the-founder/` | The Founder | ✅ 200 |
| `/the-ameer/` | The Ameer | ✅ 200 |
| `/bayan-ul-quran-by-dr-israr-ahmad/` | Bayan-ul-Quran by Dr. Israr Ahmad | ✅ 200 |

### Services (2 working of 8 tested)
| URL | Title | Status |
|-----|-------|--------|
| `/services/methodology/` | Our Methodology | ✅ 200 |
| `/services/aazadi-e-palestine/` | Services - Aazadi e Palestine | ✅ 200 |

---

## Duplicate Content Found

| Page A | Page B | Content |
|--------|--------|---------|
| `/services/methodology/` | `/organization/our-ideology/methodology/` | Both display "Our Methodology" |
| `/the-founder/` | `/organization/the-founder/` | Both display "The Founder" |
| `/the-ameer/` | `/organization/the-ameer/` | Both display "The Ameer" |

The root-level pages (`/the-founder/`, `/the-ameer/`) are **short summaries** linking to the full `/organization/the-founder/` and `/organization/the-ameer/` pages.

---

## Navigation Consistency

All pages share the same header mega-menu and 4-column footer. Navigation structure:

- **Home** → `/`
- **Organization** → `/organization/` (7 sub-pages)
- **Education** → dropdown: Ruju Ilal Quran, Distance Learning, Online Courses (external)
- **Resources** → dropdown: Audios, Videos, Books, Magazines, Press Releases, Social Media, Khitab-e-Jum'ah, FAQ's
- **Quranic Circles** → `/quranic-circles/`
- **Contact Us** → `/contact-us/`
- **Join Tanzeem** → external: `https://app.dhtr.org/contactus`

---

## Issues Found (Summary)

1. **6 broken pages** (`/services/*`) returning 404 — linked from Organization landing page cards
2. **2 broken images** pointing to `beta.tanzeem.org` instead of `alpha.tanzeem.org` (Founder page, Organization landing page)
3. **Slug inconsistency**: Background page uses `background-2` (WordPress dedup artifact)
4. **No redirects** are configured — all broken pages return hard 404
5. **No SSL issues** — site loads over HTTPS
6. **robots.txt**: Pages have `<meta name="robots" content="nofollow, noindex"/>` — site is not indexed by search engines
