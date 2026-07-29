// Multi-stage Search Normalization Pipeline for English, Roman Urdu, and Urdu Transliteration

export const PHONETIC_ALPHABET_MAP: Record<string, string[]> = {
  // Vowels
  a: ["a", "aa", "ah", "e"],
  aa: ["aa", "a", "ah"],
  e: ["e", "i", "ee"],
  ee: ["ee", "i", "e"],
  i: ["i", "ee", "e"],
  o: ["o", "u", "oo", "au"],
  oo: ["oo", "u", "o"],
  u: ["u", "oo", "o"],
  ai: ["ai", "ay"],
  ay: ["ay", "ai"],
  au: ["au", "aw", "o"],
  aw: ["aw", "au"],

  // Common consonants
  b: ["b"],
  p: ["p"],
  f: ["f", "ph"],
  ph: ["ph", "f"],

  c: ["c", "k", "q"],
  k: ["k", "c", "q"],
  q: ["q", "k", "c"],

  g: ["g", "gh"],
  gh: ["gh", "g"],

  h: ["h"],

  j: ["j", "z"],
  z: ["z", "j", "dh"],

  s: ["s", "ss", "c"],
  ss: ["ss", "s"],

  sh: ["sh", "sch"],
  sch: ["sch", "sh"],

  ch: ["ch", "che"],
  che: ["che", "ch"],

  t: ["t", "tt"],
  tt: ["tt", "t"],

  d: ["d", "dh"],
  dh: ["dh", "d", "z"],

  r: ["r"],
  l: ["l"],

  m: ["m"],
  n: ["n"],

  w: ["w", "v"],
  v: ["v", "w"],

  x: ["x", "ks"],

  y: ["y", "i"]
};

export const URDU_ROMAN_MAP: Record<string, string[]> = {
  "ا": ["a", "aa", "e", "i"],
  "آ": ["aa", "a"],
  "ب": ["b"],
  "پ": ["p"],
  "ت": ["t"],
  "ٹ": ["t"],
  "ث": ["s"],
  "ج": ["j"],
  "چ": ["ch"],
  "ح": ["h"],
  "خ": ["kh"],
  "د": ["d"],
  "ڈ": ["d"],
  "ذ": ["z"],
  "ر": ["r"],
  "ڑ": ["r"],
  "ز": ["z"],
  "ژ": ["zh"],
  "س": ["s"],
  "ش": ["sh"],
  "ص": ["s"],
  "ض": ["z"],
  "ط": ["t"],
  "ظ": ["z"],
  "ع": ["a", "e", "i", ""],
  "غ": ["gh"],
  "ف": ["f", "ph"],
  "ق": ["q", "k"],
  "ک": ["k", "q", "c"],
  "گ": ["g"],
  "ل": ["l"],
  "م": ["m"],
  "ن": ["n"],
  "ں": ["n"],
  "و": ["w", "v", "o", "u", "oo"],
  "ہ": ["h"],
  "ھ": ["h"],
  "ء": [""],
  "ی": ["y", "i", "ee"],
  "ے": ["e", "ay"]
};

export const ROMAN_URDU_SYNONYMS: Record<string, string[]> = {
  allah: ["allah", "allahh"],
  quran: ["quran", "quraan", "qur'an", "kuran", "koran"],
  hadees: ["hadees", "hadith", "hadis"],
  namaz: ["namaz", "namaaz", "salah", "salat"],
  roza: ["roza", "rozah", "sawm"],
  dua: ["dua", "dua'a"],
  zakat: ["zakat", "zakah"],
  hajj: ["hajj", "haj"],
  umrah: ["umrah", "umra"],
  eid: ["eid", "eed"],
  islam: ["islam", "islaam"],
  musalman: ["musalman", "muslim"],
  masjid: ["masjid", "mosque"],
  madrasa: ["madrasa", "madressa", "madrasah"],
  tafseer: ["tafseer", "tafsir"],
  aqeedah: ["aqeedah", "aqidah", "aqeeda"],
  sunnah: ["sunnah", "sunna"],
  deen: ["deen", "din"],
  iman: ["iman", "eeman"],
  ilm: ["ilm", "ilm-e"],
  khutbah: ["khutbah", "khutba"],
  bayan: ["bayan", "bayaan"],
  dars: ["dars", "lesson"],
  kitab: ["kitab", "kitaab", "book"]
};

export const NAME_SYNONYMS: Record<string, string[]> = {
  ejaz: ["ejaz", "ijaz", "aijaz"],
  israr: ["israr", "esrar", "israar"],
  akif: ["akif", "akeef"],
  arif: ["arif", "areef"],
  abdus: ["abdus", "abdul"],
  sami: ["sami", "samee"],
  ayub: ["ayub", "ayyub", "ayoob"],
  ghulam: ["ghulam", "gulam"],
  maqsood: ["maqsood", "maqsud", "maksud"],
  tahir: ["tahir", "taher"],
  noman: ["noman", "nouman", "nauman"],
  naveed: ["naveed", "navid", "navaid"],
  akhtar: ["akhtar", "akhter"],
  waheed: ["waheed", "wahid"],
  zameer: ["zameer", "zamir"],
  mukhtar: ["mukhtar", "mokhtar"],
  rehmatullah: [
    "rehmatullah",
    "rahmatullah",
    "rehmat ullah",
    "rahmat ullah"
  ],
  khursheed: [
    "khursheed",
    "khurshid",
    "khurshaid"
  ],
  shujauddin: [
    "shujauddin",
    "shuja ud din",
    "shujaudin",
    "shuja uddin"
  ]
};

// 1. Stage 1: Normalize input
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF]/g, "") // Keep alphanumeric, whitespace, and Urdu/Arabic range
    .replace(/\s+/g, " ");
}

// 2. Stage 2: Convert Urdu Script input to Roman English Variations
export function transliterateUrduToRoman(query: string): string[] {
  const chars = Array.from(query);
  let combinations: string[] = [""];

  for (const char of chars) {
    const replacements = URDU_ROMAN_MAP[char] || [char];
    const nextCombos: string[] = [];

    for (const prefix of combinations) {
      for (const rep of replacements) {
        nextCombos.push(prefix + rep);
      }
    }
    // Limit exponential growth
    combinations = nextCombos.slice(0, 10);
  }

  return combinations.filter(Boolean);
}

// 3. Stage 3 & 4: Multi-stage Expansion Pipeline
export function getSearchVariations(query: string): string[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const variations = new Set<string>();
  variations.add(normalized);

  // Check if input is Urdu script
  if (/[\u0600-\u06FF]/.test(query)) {
    const transliterated = transliterateUrduToRoman(query);
    transliterated.forEach((t) => variations.add(t));
  }

  const words = normalized.split(/\s+/);

  for (const word of words) {
    if (!word) continue;

    // Check NAME_SYNONYMS
    if (NAME_SYNONYMS[word]) {
      NAME_SYNONYMS[word].forEach((syn) => variations.add(syn));
    }

    // Check ROMAN_URDU_SYNONYMS
    if (ROMAN_URDU_SYNONYMS[word]) {
      ROMAN_URDU_SYNONYMS[word].forEach((syn) => variations.add(syn));
    }

    // Phonetic replacements via PHONETIC_ALPHABET_MAP
    for (const [key, mapping] of Object.entries(PHONETIC_ALPHABET_MAP)) {
      if (word.includes(key)) {
        for (const replacement of mapping) {
          if (replacement !== key) {
            variations.add(word.replace(new RegExp(key, "g"), replacement));
          }
        }
      }
    }
  }

  // Cap variations to top 15 most relevant terms for clean DB performance
  return Array.from(variations).slice(0, 15);
}
