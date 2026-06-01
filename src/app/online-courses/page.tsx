import { HubLanding } from "@/components/shared/HubLanding";

export const metadata = { title: "Online Courses | Tanzeem-e-Islami" };

export default function OnlineCoursesPage() {
  return (
    <HubLanding
      title="Online Courses"
      subtitle="Structured Quranic and Islamic education through our learning platform."
      cards={[
        {
          title: "Quran Academy LMS",
          href: "https://lms.quranacademy.com",
          external: true,
          description:
            "Enroll in online courses on Quranic studies, tafseer, and Islamic sciences through the Quran Academy learning management system.",
        },
      ]}
    />
  );
}
