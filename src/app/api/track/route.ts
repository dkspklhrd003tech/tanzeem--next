import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  audio,
  videos,
  books,
  magazines,
  sermons,
  khitabAudios,
  audioBooks,
  downloads
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { entityType, entityId, actionType } = await req.json();

    if (!entityType || !entityId || !actionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const actionMap: Record<string, string> = {
      play: "playCount",
      download: "downloadCount",
      share: "shareCount"
    };

    const targetColumn = actionMap[actionType];
    if (!targetColumn) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    let table: any = null;
    let sqlIncrement: any = null;

    switch (entityType) {
      case "audio":
        table = audio;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "video":
        table = videos;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "book":
        table = books;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "magazine":
        table = magazines;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "sermon":
        table = sermons;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "khitabAudio":
        table = khitabAudios;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "audioBook":
        table = audioBooks;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      case "download":
        table = downloads;
        sqlIncrement = actionType === "play" ? sql`play_count + 1` :
                       actionType === "download" ? sql`download_count + 1` :
                       sql`share_count + 1`;
        break;
      default:
        return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    // Determine id column field depending on if they are using slug or id
    // Most frontend routes pass the slug or the id. Let's try matching id first, if not found then slug.
    // Actually, to be safe, we can just update where id = entityId OR slug = entityId.
    
    await db
      .update(table)
      .set({ [targetColumn]: sqlIncrement })
      .where(sql`${table.id} = ${entityId} OR ${table.slug} = ${entityId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track metric:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
