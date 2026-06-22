import { Metadata } from "next";
import { JoinPage } from "@/components/join/JoinPage";
import { getCmsPage } from "@/lib/page-helpers";
import { RedirectPage } from "@/components/shared/RedirectPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join Tanzeem-e-Islami | RAFEEQ & RAFEEQAH",
  description:
    "Join Tanzeem-e-Islami and become a RAFEEQ or RAFEEQAH — a companion in the mission to establish the Islamic system.",
  keywords: ["Join Tanzeem", "RAFEEQ", "RAFEEQAH", "Islamic movement membership", "Tanzeem-e-Islami"],
};

export default async function JoinRoute() {
  const { page } = await getCmsPage("join");

  if (page && page.template === "redirect") {
    return <RedirectPage title={page.title} url={page.content.trim() || "https://app.dhtr.org/contactus"} />;
  }

  return <JoinPage />;
}
