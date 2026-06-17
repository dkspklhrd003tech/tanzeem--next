import { redirect } from "next/navigation";

/**
 * /sitemanager → redirect to the dashboard.
 * The old SPA (single-page with ?section= params) is preserved at the dashboard
 * which still mounts the existing AdminPages component via /sitemanager?section=xxx links.
 */
export default function SiteManagerRoot() {
    redirect("/sitemanager/dashboard");
}
