import { AdminPages } from "@/components/admin";
import { notFound } from "next/navigation";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams.section) {
    notFound();
  }

  return <AdminPages section={resolvedParams.section} />;
}
