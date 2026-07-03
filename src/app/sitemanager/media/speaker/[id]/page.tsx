import SpeakerFormPage from "@/components/admin/SpeakerFormPage";

export default async function SpeakerEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpeakerFormPage id={id} />;
}
