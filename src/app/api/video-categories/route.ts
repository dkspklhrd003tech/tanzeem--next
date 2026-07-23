import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { videoCategories } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { videos } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const rawCategories = await db.select().from(videoCategories).orderBy(asc(videoCategories.order), desc(videoCategories.createdAt));
    const allVideos = await db.select().from(videos).orderBy(asc(videos.order), desc(videos.createdAt));
    
    const categories = rawCategories
      .filter(cat => !cat.parentId)
      .map(mainCat => {
        const subCats = rawCategories
          .filter(subCat => subCat.parentId === mainCat.id)
          .map(subCat => ({
            ...subCat,
            videos: allVideos.filter(v => v.categoryId === subCat.id)
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const directMedia = allVideos.filter(v => v.categoryId === mainCat.id);
        if (directMedia.length > 0) {
          subCats.unshift({
            id: mainCat.id + "_direct",
            parentId: mainCat.id,
            name: "(General)",
            slug: mainCat.slug + "-general",
            code: "",
            imageUrl: mainCat.imageUrl,
            description: "Directly attached media",
            order: 0,
            isActive: true,
            customFields: null,
            createdAt: mainCat.createdAt,
            updatedAt: mainCat.updatedAt,
            videos: directMedia
          });
        }

        return {
          ...mainCat,
          subCategories: subCats
        };
      });
    
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch video categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uuidv4();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    await db.insert(videoCategories).values({
      id,
      parentId: body.parentId || null,
      name: body.name,
      slug,
      code: body.code,
      imageUrl: body.imageUrl,
      description: body.description,
      order: body.order || 0,
      isActive: body.isActive ?? true,
      customFields: body.customFields || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    revalidatePath("/", "layout");
    return NextResponse.json({ id, success: true });
  } catch (error) {
    revalidatePath("/", "layout");
    return NextResponse.json({ error: "Failed to create video category" }, { status: 500 });
  }
}

