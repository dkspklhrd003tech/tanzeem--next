import { Metadata } from "next";
import { JoinPage } from "@/components/join/JoinPage";

export const metadata: Metadata = {
  title: "Join Tanzeem-e-Islami | RAFEEQ & RAFEEQAH",
  description:
    "Join Tanzeem-e-Islami and become a RAFEEQ or RAFEEQAH — a companion in the mission to establish the Islamic system.",
  keywords: ["Join Tanzeem", "RAFEEQ", "RAFEEQAH", "Islamic movement membership", "Tanzeem-e-Islami"],
};

export default function JoinRoute() {
  return <JoinPage />;
}
