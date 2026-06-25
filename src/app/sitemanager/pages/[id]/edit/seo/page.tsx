import PageSeoManager from "@/components/admin/PageSeoManager";

export default async function PageSeoRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PageSeoManager pageId={resolvedParams.id} />;
}
