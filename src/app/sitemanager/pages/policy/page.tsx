import { PolicyPageEditor } from "@/components/admin/PolicyPageEditor";

export const metadata = {
  title: "Policy Page Manager | Admin Panel",
  description: "Manage the content of the policy page",
};

export default function PolicyManagerPage() {
  return <PolicyPageEditor />;
}
