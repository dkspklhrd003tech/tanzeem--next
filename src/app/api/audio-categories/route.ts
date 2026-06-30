import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { audioCategories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { audio } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const rawCategories = await db.select().from(audioCategories).orderBy(desc(audioCategories.order), desc(audioCategories.createdAt));
    const allAudio = await db.select().from(audio);
    
    const categories = rawCategories
      .filter(cat => !cat.parentId)
      .map(mainCat => {
        const subCats = rawCategories
          .filter(subCat => subCat.parentId === mainCat.id)
          .map(subCat => ({
            ...subCat,
            audioFiles: allAudio.filter(a => a.categoryId === subCat.id)
          }));

        const directMedia = allAudio.filter(a => a.categoryId === mainCat.id);
        if (directMedia.length > 0) {
          subCats.unshift({
            id: mainCat.id + "_direct",
            parentId: mainCat.id,
            name: "(General)",
            slug: mainCat.slug + "-general",
            code: "",
            description: "Directly attached media",
            order: 0,
            isActive: true,
            createdAt: mainCat.createdAt,
            updatedAt: mainCat.updatedAt,
            audioFiles: directMedia
          });
        }

        return {
          ...mainCat,
          subCategories: subCats
        };
      });
    
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audio categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uuidv4();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    await db.insert(audioCategories).values({
      id,
      parentId: body.parentId || null,
      name: body.name,
      slug,
      code: body.code,
      description: body.description,
      order: body.order || 0,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    revalidatePath("/", "layout");
    return NextResponse.json({ id, success: true });
  } catch (error) {
    revalidatePath("/", "layout");
    return NextResponse.json({ error: "Failed to create audio category" }, { status: 500 });
  }
}

