import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customFieldDefinitions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");

    if (!entityType) {
      return NextResponse.json({ error: "Missing entityType" }, { status: 400 });
    }

    const fields = await db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.entityType, entityType))
      .orderBy(asc(customFieldDefinitions.orderIndex));

    return NextResponse.json({ fields });
  } catch (error: any) {
    console.error("GET /api/custom-fields error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { entityType, fields } = await req.json();

    if (!entityType) {
      return NextResponse.json({ error: "Missing entityType" }, { status: 400 });
    }
    
    await db.transaction(async (tx) => {
      await tx
        .delete(customFieldDefinitions)
        .where(eq(customFieldDefinitions.entityType, entityType));

      if (fields && fields.length > 0) {
        const recordsToInsert = fields.map((f: any, index: number) => ({
          id: f.id || uuidv4(),
          entityType,
          label: f.label,
          fieldKey: f.fieldKey,
          fieldType: f.fieldType,
          options: f.options || null,
          isRequired: f.isRequired || false,
          placeholder: f.placeholder || null,
          helpText: f.helpText || null,
          orderIndex: index,
          isActive: true,
        }));

        await tx.insert(customFieldDefinitions).values(recordsToInsert);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/custom-fields error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
