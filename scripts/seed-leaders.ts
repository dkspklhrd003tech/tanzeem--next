import { db } from "../src/db";
import { pages } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Seeding leader pages...");

  // 1. Founder Page
  const founderContent = `
    <p>Dr. Israr Ahmad, the second son of a government servant, was born on April 26, 1932 in Hisar (a district of East Punjab, now a part of Haryana) in India. He graduated from King Edward Medical College (Lahore) in 1954 and later received his masters in Islamic Studies from the University of Karachi in 1965. He came under the influence of Allama Iqbal and Maulana Abul A\`la Maududi as a young student, worked briefly for Muslim Student’s Federation in the Independence Movement and, following the creation of Pakistan in 1947, for the Islami Jami\`yat-e-Talaba and then for the Jama\`at-e-Islami.</p>
    
    <p>Dr. Israr Ahmad resigned from the Jama\`at in April 1957 because of its involvement in the electoral politics, which he believed was irreconcilable with the revolutionary methodology adopted by the Jama’at in the pre-1947 period. While still a student and an activist of the Islami Jami\`yat-e-Talaba, Dr. Israr Ahmad gained considerable fame and eminence as a Mudarris (or teacher) of the Holy Qur’an.</p>
    
    <p>Even after resigning from the Jama\`at, he continued to give Qur’anic lectures in different cities of Pakistan, and especially after 1965 he has, according to his own disclosure, invested the better part of his physical and intellectual abilities in the learning and teaching of the Qur’an’ic wisdom.</p>
    
    <p>Dr. Israr Ahmad wrote an extremely significant tract in 1967 in which he explained his basic thought — that an Islamic Renaissance is possible only by revitalizing the Iman (true faith and conviction) among the Muslims, particularly their intelligentsia. The revitalization of Iman, in turn, is possible only by the propagation of the Qur’an’ic teachings and the study of the Qur’an in modern terms.</p>
  `.trim();

  await db.update(pages)
    .set({
      title: "Dr. Israr Ahmed",
      content: founderContent,
      excerpt: "APRIL 26, 1932 – APRIL 14, 2010",
      featuredImage: "/uploads/40384275-a53c-4bdb-8134-d748eb00d88c-founder.webp",
      template: "leader",
      isPublished: true,
      updatedAt: new Date()
    })
    .where(eq(pages.slug, "organization/the-founder"));
  console.log("Successfully updated The Founder page.");

  // 2. Ameer Page
  const ameerContent = `
    <p>Mohtaram Shujauddin Shaikh is the current Ameer (leader) of Tanzeem-e-Islami, who assumed the responsibility in 2020 following the resignation of Hafiz Akif Saeed on health grounds. Born on September 29, 1974, he has been an active member of the organization for over two decades, contributing significantly to its educational, organizational, and propagation activities across Pakistan and internationally.</p>
    
    <p>Before assuming the leadership, he served in various key capacities within Tanzeem-e-Islami, including as the Nazim of different regions and as a prominent speaker of Quranic lectures. He has gained widespread recognition for his articulation of Islamic teachings in the context of contemporary socio-political and economic challenges.</p>
    
    <p>Under his leadership, Tanzeem-e-Islami has significantly expanded its digital outreach, utilizing modern media platforms to broadcast Quranic education, lectures, and organizational messages to a global audience. He remains committed to the core vision of the founder, Dr. Israr Ahmed, focusing on individual reform (Tazkiyah) and collective struggle for the establishment of the Islamic system (Khilafah).</p>
    
    <p>He regularly delivers the Friday Sermon (Khitab-e-Jum'ah) at the central Quran Academy in Lahore and travels extensively to engage with different chapters of the organization and the broader Muslim community, emphasizing unity and disciplined effort.</p>
  `.trim();

  await db.update(pages)
    .set({
      title: "Shujauddin Shaikh",
      content: ameerContent,
      excerpt: "AMEER (2020 – PRESENT)",
      featuredImage: "/uploads/f9d523c3-80f5-4aa9-8bcb-9394cfdb15ca-ameer.webp",
      template: "leader",
      isPublished: true,
      updatedAt: new Date()
    })
    .where(eq(pages.slug, "organization/the-ameer"));
  console.log("Successfully updated The Ameer page.");

  process.exit(0);
}

run();
