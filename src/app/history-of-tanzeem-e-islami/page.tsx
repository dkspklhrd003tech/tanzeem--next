import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [page] = await db.select().from(pages).where(eq(pages.slug, "history-of-tanzeem-e-islami")).limit(1);
  return {
    title: page?.metaTitle || "History of Tanzeem-e-Islami | Tanzeem-e-Islami",
    description: page?.metaDescription || "The journey of Tanzeem-e-Islami from its founding to the present day.",
  };
}

const DEFAULT_DATA = {
  hero: {
    heading: "Our History",
    quoteTitle: "The essence of what we call the",
    quoteText: "\"It is not enough to practice Islam in one's individual life but that the teachings of the Qur'an and those of the Sunnah of Prophet Muhammad (SAW) must also be implemented in their totality in the social, cultural, juristic, political, and the economic spheres of life.\"",
    content: "The credit for reviving this dynamic concept of Islam in the Indian subcontinent, after centuries of neglect and dormancy, goes to Allama Muhammad Iqbal. The first attempt towards the actualization of this concept was made by Maulana Abul Kalam Azad through his short-lived party, the Hizbullah.\n\nAnother attempt was made by Maulana Sayyid Abul A'la Maududi through his Jama'at-e-Islami; however, the decision by the Jama'at after the creation of Pakistan to take part in the electoral process instead of continuing the original revolutionary methodology gradually resulted in its degeneration from a pure Islamic revolutionary party to a mere political one.\n\nWhen Jama'at-e-Islami entered in the electoral process in 1956, a group of individuals including Dr. Israr Ahmed resigned on account of their disagreement with the leadership of the Jama'at on significant policy matters. They came together and tried unsuccessfully to form an organized group that was expected to fulfill the vacuum created by the post-1947 change in the direction and course of Jama'at-e-Islami. A resolution was passed which subsequently became the Mission Statement of Tanzeem-e-Islami.\n\nWhile continuing his Quranic lectures, Dr. Israr kept waiting for his former colleagues to initiate efforts of Islamic renaissance through the revolutionary process. However upon realizing that nobody was coming forward to shoulder this responsibility, he decided to step-on for this effort and call people to make a disciplined organization and he therefore laid the foundation of Tanzeem-e-Islami."
  },
  banner: {
    text: "Prayer's are Important in Islam, Being Muslim is for all day. Not just 5 times a day."
  },
  joinUs: {
    heading: "Join Us",
    subheading: "Any Male Or Female Muslim Can Join Tanzeem-E-Islami By Giving A Pledge\n(Or Baiy'ah) Of Obedience.",
    rafeeq: {
      heading: "RAFEEQ",
      landline: "+92-42-35473375-78",
      email: "markaz@tanzeem.org",
      address: "Dar ul Islam, Markaz Tanzeem-e-Islami, Multan Road, Chung Lahore."
    },
    rafeeqah: {
      heading: "RAFEEQAH",
      landline: "+92-42-35869501-03",
      email: "khwateen@tanzeem.org",
      address: "Office Tanzeem-e-Islami Halqa Khwateen 36-K, Model Town, Lahore."
    },
    note: "Note:\nSend us an email that you have sent us the forms by mail or courier."
  }
};

export default async function HistoryOfTanzeemPage() {
  const [pageData] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, "history-of-tanzeem-e-islami"))
    .limit(1);

  let content = DEFAULT_DATA;
  if (pageData && pageData.content) {
    try {
      const parsed = JSON.parse(pageData.content);
      if (parsed.hero) {
        content = parsed;
      }
    } catch (e) {
      // Use default
    }
  }

  return (
    <main className=" bg-background flex flex-col">
      {/* Hero Section */}
      <section className="mx-auto px-4 md:py-12 max-w-7xl">

        <div className="gap-8 mb-12">
          <div className="md:col-span-5 md:col-start-7">
            <h3 className="font-bold text-lg mb-2">{content.hero.quoteTitle}</h3>
            <div className="bg-primary-light p-6 rounded-lg relative">
              <p className="text-foreground leading-relaxed italic">
                {content.hero.quoteText}
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-lg  max-w-none text-foreground space-y-6">
          {content.hero.content.split('\n').map((para, i) => {
            if (!para.trim()) return null;
            return <p key={i} dangerouslySetInnerHTML={{ __html: para }} />;
          })}
        </div>
      </section>

      {/* Dark Banner Section */}
      <section className="w-full bg-primary relative py-20 overflow-hidden">
        {/* Decorative background pattern - simplified for this implementation */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white max-w-4xl mx-auto leading-tight">
            {content.banner.text}
          </h2>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.joinUs.heading}</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto whitespace-pre-line">
          {content.joinUs.subheading}
        </p>

        {/* Divider icon */}
        <div className="flex justify-center mb-12">
          <div className="w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center relative">
            {/* SVG Star representation */}
            <div className="absolute w-4 h-4 bg-foreground transform rotate-45"></div>
            <div className="absolute w-4 h-4 bg-foreground"></div>
            <div className="absolute w-3 h-3 bg-background z-10"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* RAFEEQ Card */}
          <div className="bg-card rounded-xl p-8 border shadow-sm flex flex-col items-center">
            <div className="mb-6 text-foreground">
              {/* Male Icon representation */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 underline decoration-2 underline-offset-4">{content.joinUs.rafeeq.heading || "RAFEEQ"}</h3>

            <div className="space-y-3 text-sm mb-8 w-full text-left">
              <p><strong className="text-foreground">Landline:</strong> <span className="text-muted-foreground">{content.joinUs.rafeeq.landline}</span></p>
              <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{content.joinUs.rafeeq.email}</span></p>
              <p><strong className="text-foreground">Address:</strong> <span className="text-muted-foreground">{content.joinUs.rafeeq.address}</span></p>
            </div>

            <div className="flex gap-4 w-full mt-auto">
              <Link href="#" className="flex-1 py-2 px-4 rounded-full border border-foreground/20 font-medium hover:bg-muted transition-colors">English</Link>
              <Link href="#" className="flex-1 py-2 px-4 rounded-full border border-foreground/20 font-medium hover:bg-muted transition-colors">Urdu</Link>
            </div>
          </div>

          {/* RAFEEQAH Card */}
          <div className="bg-card rounded-xl p-8 border shadow-sm flex flex-col items-center">
            <div className="mb-6 text-emerald-800 ">
              {/* Female Icon representation */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11c-2.8 0-5 2.2-5 5v5h10v-5c0-2.8-2.2-5-5-5z"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 underline decoration-2 underline-offset-4">{content.joinUs.rafeeqah.heading || "RAFEEQAH"}</h3>

            <div className="space-y-3 text-sm mb-8 w-full text-left">
              <p><strong className="text-foreground">Landline:</strong> <span className="text-muted-foreground">{content.joinUs.rafeeqah.landline}</span></p>
              <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{content.joinUs.rafeeqah.email}</span></p>
              <p><strong className="text-foreground">Address:</strong> <span className="text-muted-foreground">{content.joinUs.rafeeqah.address}</span></p>
            </div>

            <div className="flex gap-4 w-full mt-auto">
              <Link href="#" className="flex-1 py-2 px-4 rounded-full border border-foreground/20 font-medium hover:bg-muted transition-colors">English</Link>
              <Link href="#" className="flex-1 py-2 px-4 rounded-full border border-foreground/20 font-medium hover:bg-muted transition-colors">Urdu</Link>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 bg-amber-50/50  rounded-xl p-6 max-w-4xl mx-auto text-left border border-amber-100 ">
          <p className="text-amber-800  text-sm whitespace-pre-line font-medium">
            {content.joinUs.note}
          </p>
        </div>
      </section>
    </main>
  );
}
