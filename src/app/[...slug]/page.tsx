import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const slugArray = resolvedParams.slug;
    const slug = slugArray[slugArray.length - 1]; // Get the last part of the path as the actual slug

    const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
    });

    if (!page || !page.isPublished) {
        return {
            title: "Page Not Found",
        };
    }

    return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || page.excerpt,
        keywords: page.metaKeywords?.split(','),
        openGraph: {
            title: page.metaTitle || page.title,
            description: page.metaDescription || page.excerpt || undefined,
            url: `https://www.tanzeem.org/${slug}`,
            siteName: "Tanzeem-e-Islami",
            images: [
                {
                    url: page.featuredImage || "/default-og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: page.title,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: page.metaTitle || page.title,
            description: page.metaDescription || page.excerpt || undefined,
            images: [page.featuredImage || "/default-og-image.jpg"],
        },
        alternates: {
            canonical: `https://www.tanzeem.org/${slug}`,
        }
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const resolvedParams = await params;
    const slugArray = resolvedParams.slug;
    const slug = slugArray[slugArray.length - 1]; // Support nested routes like /about/history

    const page = await db.query.pages.findFirst({
        where: eq(pages.slug, slug),
    });

    // If page doesn't exist or isn't published, show 404
    if (!page || !page.isPublished) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": page.metaTitle || page.title,
        "description": page.metaDescription || page.excerpt,
        "image": page.featuredImage ? [page.featuredImage] : [],
        "author": [{
            "@type": "Organization",
            "name": "Tanzeem-e-Islami",
            "url": "https://www.tanzeem.org"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Tanzeem-e-Islami",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.tanzeem.org/wp-content/uploads/2023/11/logo.png"
            }
        },
        "datePublished": page.publishedAt ? new Date(page.publishedAt).toISOString() : new Date().toISOString(),
        "dateModified": page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.tanzeem.org/${slug}`
        }
    };

    // Render the page content based on its template
    // We can expand this later to use different components based on page.template
    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Page Header Component (optional, can be added later) */}
            <main className="container mx-auto py-12 md:py-16">
                <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
                        {page.title}
                    </h1>

                    {page.featuredImage && (
                        <div className="mb-8 rounded-2xl overflow-hidden aspect-video relative">
                            <img
                                src={page.featuredImage}
                                alt={page.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Render HTML content securely.  
              In a real app, you might want to sanitize this, but since it's from our own admin, 
              dangerouslySetInnerHTML is acceptable for now. */}
                    <div
                        className="mt-8"
                        dangerouslySetInnerHTML={{ __html: page.content || "" }}
                    />
                </article>
            </main>
        </div>
    );
}
