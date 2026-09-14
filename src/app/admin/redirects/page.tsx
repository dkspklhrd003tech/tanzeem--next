import { redirect } from "next/navigation";

export default async function AdminRedirectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab;
  if (tab) {
    redirect(`/sitemanager/redirects?tab=${encodeURIComponent(tab)}`);
  }
  redirect("/sitemanager/redirects");
}
