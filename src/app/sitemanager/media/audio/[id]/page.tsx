import AudioFormPage from "@/components/admin/AudioFormPage";

export default async function AudioEditRoute({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ speaker?: string, category?: string }> }) {
  const { id } = await params;
  const sParams = await searchParams;
  return <AudioFormPage id={id} speakerIdParam={sParams.speaker || ""} categoryIdParam={sParams.category || ""} />;
}
