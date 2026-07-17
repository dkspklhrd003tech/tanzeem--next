"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HomeSlidersManagement } from "./HomeSlidersManagement";
import { FeaturedBooks } from "./HomepageFeatures/FeaturedBooks";
import { FeaturedMagazines } from "./HomepageFeatures/FeaturedMagazines";
import { AboutMissionSettings } from "./HomepageFeatures/AboutMissionSettings";
import { LeaderProfiles } from "./HomepageFeatures/LeaderProfiles";
import { SocialMediaSettings } from "./HomepageFeatures/SocialMediaSettings";
import { HomepageSeoSettings } from "./HomepageFeatures/HomepageSeoSettings";
import { Settings, Image as ImageIcon, BookOpen, Layers, Target, Type, Users, Video, Share2, Search, Sparkles, Megaphone } from "lucide-react";
import ServicesPageEditor from "./ServicesPageEditor";
import CampaignsPageEditor from "./CampaignsPageEditor";
import { useEffect, useState } from "react";
import { PageSpinner } from "@/components/ui/spinner";

function PageEditorWrapper({ id, EditorComponent }: { id: string, EditorComponent: any }) {
    const [page, setPage] = useState<any>(null);
    useEffect(() => {
        fetch(`/api/sitemanager/pages/${id}`)
            .then(res => res.ok ? res.json() : { error: true })
            .then(data => {
                if (data.page) setPage(data.page);
                else setPage({
                    id, slug: id, title: id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    content: "", excerpt: "", isPublished: true, metaTitle: id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    metaDescription: "",                 });
            })
            .catch(() => setPage({
                id, slug: id, title: id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                content: "", excerpt: "", isPublished: true, metaTitle: id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                metaDescription: "",             }));
    }, [id]);

    if (!page) return <div className="p-10 flex justify-center"><PageSpinner /></div>;
    return <EditorComponent pageId={id} initialPageData={page} />;
}

export function HomepageManager() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    Homepage Setup
                </h1>
                <p className="text-foreground-muted">Manage the Dynamic Content Layout of the Main Landing Page</p>
            </div>

            <Tabs defaultValue="sliders" variant="bubble" className="w-full">
                <TabsList>
                    <TabsTrigger value="sliders">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Hero Sliders
                    </TabsTrigger>
                    <TabsTrigger value="about">
                        <Type className="w-4 h-4 mr-1" />
                        About & Mission
                    </TabsTrigger>
                    <TabsTrigger value="leaders">
                        <Users className="w-4 h-4 mr-1" />
                        Leader Profiles
                    </TabsTrigger>
                    <TabsTrigger value="services">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Spotlight (Services)
                    </TabsTrigger>
                    <TabsTrigger value="campaigns">
                        <Megaphone className="w-4 h-4 mr-1" />
                        Featured (Campaigns)
                    </TabsTrigger>
                    <TabsTrigger value="magazines">
                        <Layers className="w-4 h-4 mr-1" />
                        Featured Magazines
                    </TabsTrigger>
                    <TabsTrigger value="books">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Featured Books
                    </TabsTrigger>
                    <TabsTrigger value="social">
                        <Share2 className="w-4 h-4 mr-1" />
                        Social Media
                    </TabsTrigger>
                    <TabsTrigger value="seo">
                        <Search className="w-4 h-4 mr-1" />
                        Basic SEO
                    </TabsTrigger>
                </TabsList>

                <div className="bg-card rounded-xl border border-border p-6 shadow-sm min-h-[500px]">
                    <TabsContent value="sliders" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <HomeSlidersManagement />
                        </div>
                    </TabsContent>

                    <TabsContent value="about" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <AboutMissionSettings />
                        </div>
                    </TabsContent>

                    <TabsContent value="leaders" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <LeaderProfiles />
                        </div>
                    </TabsContent>

                    <TabsContent value="books" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <FeaturedBooks />
                        </div>
                    </TabsContent>

                    <TabsContent value="magazines" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <FeaturedMagazines />
                        </div>
                    </TabsContent>

                    <TabsContent value="social" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <SocialMediaSettings />
                        </div>
                    </TabsContent>

                    <TabsContent value="services" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <PageEditorWrapper id="services" EditorComponent={ServicesPageEditor} />
                        </div>
                    </TabsContent>

                    <TabsContent value="campaigns" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <PageEditorWrapper id="campaigns" EditorComponent={CampaignsPageEditor} />
                        </div>
                    </TabsContent>

                    <TabsContent value="seo" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <HomepageSeoSettings />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
