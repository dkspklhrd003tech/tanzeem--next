import { DarseQuranBanner } from "@/components/darse-quran/DarseQuranBanner";
import { DarseQuranFilters } from "@/components/darse-quran/DarseQuranFilters";
import { DarseQuranGrid } from "@/components/darse-quran/DarseQuranGrid";

// Note: In Next 13+ app router layouts are persistent, but we assemble the full view here
// bypassing the inner generic page margins if needed, or stacking them.

export default function DarseQuranPage() {
    return (
        <main className="flex flex-col min-h-screen bg-background pb-12 w-full">
            <DarseQuranBanner />
            <DarseQuranFilters />
            <DarseQuranGrid />
        </main>
    );
}
