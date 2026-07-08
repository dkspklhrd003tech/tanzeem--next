"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HomeSlidersManagement } from "./HomeSlidersManagement";
import { FeaturedBooks } from "./HomepageFeatures/FeaturedBooks";
import { FeaturedMagazines } from "./HomepageFeatures/FeaturedMagazines";
import { AboutMissionSettings } from "./HomepageFeatures/AboutMissionSettings";
import { LeaderProfiles } from "./HomepageFeatures/LeaderProfiles";
import { FeaturedVideos } from "./HomepageFeatures/FeaturedVideos";
import { SocialMediaSettings } from "./HomepageFeatures/SocialMediaSettings";
import { Settings, Image as ImageIcon, BookOpen, Layers, Target, Type, Users, Video, Share2 } from "lucide-react";

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

            <Tabs defaultValue="sliders" className="w-full">
                <TabsList className="mb-6 bg-muted/50 p-1 border border-border rounded-xl flex flex-wrap justify-center h-auto gap-1 shadow-sm max-w-full">
                    <TabsTrigger value="sliders" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Hero Sliders
                    </TabsTrigger>
                    <TabsTrigger value="about" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <Type className="w-4 h-4 mr-2" />
                        About & Mission
                    </TabsTrigger>
                    <TabsTrigger value="leaders" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <Users className="w-4 h-4 mr-2" />
                        Leader Profiles
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <Video className="w-4 h-4 mr-2" />
                        Featured Videos
                    </TabsTrigger>
                    <TabsTrigger value="books" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Featured Books
                    </TabsTrigger>
                    <TabsTrigger value="magazines" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <Layers className="w-4 h-4 mr-2" />
                        Featured Magazines
                    </TabsTrigger>
                    <TabsTrigger value="social" className="py-2.5 px-6 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap">
                        <Share2 className="w-4 h-4 mr-2" />
                        Social Media
                    </TabsTrigger>
                </TabsList>

                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[500px]">
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

                    <TabsContent value="videos" className="mt-0 outline-none">
                        <div className="max-w-7xl">
                            <FeaturedVideos />
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
                </div>
            </Tabs>
        </div>
    );
}
