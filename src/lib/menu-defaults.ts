export interface DefaultMenuItem {
  id: string;
  label: string;
  url?: string | null;
  external?: boolean;
  children?: DefaultMenuItem[];
}

export const DEFAULT_MENU_HEADER: DefaultMenuItem[] = [
  { id: "dm-home", label: "Home", url: "/" },
  {
    id: "dm-org", label: "Organization", url: "/organization",
    children: [
      { id: "dm-org-bg",   label: "Background",        url: "/organization/background" },
      { id: "dm-org-ms",   label: "Mission Statement",  url: "/organization/mission-statement" },
      {
        id: "dm-org-ideo", label: "Our Ideology", url: "/organization/our-ideology",
        children: [
          { id: "dm-ideo-bb",  label: "Basic Belief",        url: "/organization/our-ideology/basic-belief" },
          { id: "dm-ideo-ob",  label: "Our Obligations",     url: "/organization/our-ideology/our-obligations" },
          { id: "dm-ideo-me",  label: "Our Methodology",     url: "/organization/our-ideology/methodology" },
          { id: "dm-ideo-fo",  label: "Foundation",          url: "/organization/our-ideology/foundation" },
        ],
      },
      { id: "dm-org-fo",   label: "The Founder",        url: "/organization/the-founder" },
      { id: "dm-org-am",   label: "The Ameer",          url: "/organization/the-ameer" },
    ],
  },
  {
    id: "dm-res", label: "Resources", url: null,
    children: [
      {
        id: "dm-res-aud", label: "Audios", url: "/resources/audios",
        children: [
          { id: "dm-aud-sp",  label: "By Speaker",   url: "/resources/audios/by-speaker" },
          { id: "dm-aud-cat", label: "By Category",  url: "/resources/audios/by-category" },
          { id: "dm-aud-ab",  label: "Audio Books",  url: "/resources/audio-books" },
        ],
      },
      {
        id: "dm-res-vid", label: "Videos", url: "/resources/videos",
        children: [
          { id: "dm-vid-cat",  label: "By Category",                  url: "/resources/videos/by-category" },
          { id: "dm-vid-spk",  label: "By Speakers",                  url: "/resources/videos/by-speakers" },
          { id: "dm-vid-dri1", label: "Dr. Israr Ahmad Lectures",     url: "https://www.drisrar.com/", external: true },
          { id: "dm-vid-dri2", label: "Dr. Israr Ahmad (Q&A)",        url: "https://www.drisrar.com/videos/category/12/sub__1254", external: true },
          { id: "dm-vid-bq",   label: "Bayan ul Quran",               url: "https://www.drisrar.com/videos/category/1/sub__1033", external: true },
          { id: "dm-vid-mn",   label: "Muntakab Nisab",               url: "https://www.drisrar.com/videos/category/4?page_id=1", external: true },
          { id: "dm-vid-vc",   label: "Dr. Israr Ahmad (Video Clips)", url: "https://www.drisrar.com/videos/category/1031?page_id=1", external: true },
        ],
      },
      {
        id: "dm-res-bk", label: "Books", url: "/resources/books",
        children: [
          { id: "dm-bk-ab",  label: "Audio Books",      url: "/resources/audio-books" },
          { id: "dm-bk-cat", label: "Books by Category", url: "/resources/books/by-category" },
        ],
      },
      {
        id: "dm-res-mag", label: "Magazines", url: "/resources/magazines",
        children: [
          { id: "dm-mag-mq", label: "Meesaq",          url: "/resources/magazines/meesaq" },
          { id: "dm-mag-hq", label: "Hikmat-e-Quran",  url: "/resources/magazines/hikmat-e-quran" },
          { id: "dm-mag-nk", label: "Nida-e-Khilafat", url: "/resources/magazines/nida-e-khilafat" },
        ],
      },
      { id: "dm-res-pr",  label: "Press Releases",          url: "/resources/press-releases" },
      { id: "dm-res-sm",  label: "Social Media",             url: "/resources/social-media" },
      { id: "dm-res-kj",  label: "Khitab-e-Jum'ah (Audio)", url: "/resources/khitab-e-jumah" },
    ],
  },
  {
    id: "dm-pp", label: "Public Programs", url: "/public-programs",
    children: [
      { id: "dm-pp-qc", label: "Quranic Circles",               url: "/public-programs/quranic-circles" },
      { id: "dm-pp-kj", label: "Khitabat-e-Jummah Addresses",   url: "/public-programs/khitabat-e-jummah" },
    ],
  },
  { id: "dm-oc",   label: "Online Courses", url: "https://lms.quranacademy.com/", external: true },
  { id: "dm-faq",  label: "FAQs",           url: "/faqs" },
  { id: "dm-join", label: "Join Tanzeem",   url: "https://app.dhtr.org/contactus", external: true },
  { id: "dm-con",  label: "Contact Us",     url: "/contact" },
];

export const DEFAULT_MENU_FOOTER: DefaultMenuItem[] = [
  { id: "df-home",  label: "Home",             url: "/" },
  { id: "df-about", label: "About",            url: "/organization" },
  { id: "df-res",   label: "Resources",        url: "/resources" },
  { id: "df-prog",  label: "Public Programs",  url: "/public-programs" },
  { id: "df-faq",   label: "FAQs",             url: "/faqs" },
  { id: "df-con",   label: "Contact",          url: "/contact" },
  { id: "df-pol",   label: "Privacy Policy",   url: "/policy" },
];
