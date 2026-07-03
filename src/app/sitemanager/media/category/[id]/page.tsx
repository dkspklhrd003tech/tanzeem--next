import CategoryFormPage from "@/components/admin/CategoryFormPage";

export default async function CategoryEditRoute({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ type?: string }> }) {
  const { id } = await params;
  const sParams = await searchParams;
  return <CategoryFormPage id={id} type={sParams.type || "audio-categories"} />;
}
