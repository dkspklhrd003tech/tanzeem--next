import { db } from "@/db";
import { sermons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CTABanner } from "@/components/shared/CTABanner";
import { Card, CardContent } from "@/components/ui/card";
import { Mic } from "lucide-react";
import { WaveformPlayer } from "@/components/resources/WaveformPlayer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Khitab-e-Jum'ah | Tanzeem-e-Islami",
    description: "Friday sermons (Khitab-e-Jum'ah) from Tanzeem-e-Islami.",
    openGraph: {
        title: "Khitab-e-Jum'ah | Tanzeem-e-Islami",
        description: "Friday sermons (Khitab-e-Jum'ah) from Tanzeem-e-Islami.",
    },
};

export default async function KhitabEJumahPage() {
    const items = await db
        .select()
        .from(sermons)
        .where(eq(sermons.isPublished, true))
        .orderBy(desc(sermons.createdAt))
        .limit(50);

    return (
        <main className=" bg-background">
            <div className="container mx-auto py-6 md:py-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Khitab-e-Jum&apos;ah (Friday Sermons)</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Listen to the weekly Friday sermons by the Ameer of Tanzeem-e-Islami and other speakers.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                                            <Mic className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                                            </p>
                                            {item.audioUrl && (
                                                <div className="mt-3">
                                                    <WaveformPlayer
                                                        audioUrl={item.audioUrl}
                                                        title={item.title}
                                                        publishedAt={item.createdAt}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {items.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                No sermons found. Please check back later.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CTABanner
                heading="Find a Jummah Venue Near You"
                subheading="Join us for Friday prayers at one of our official venues."
                buttonLabel="Jummah Venues"
                buttonUrl="/khitabat-addresses"
            />
        </main>
    );
}
