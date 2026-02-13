import { NextResponse } from "next/server";
import { db } from "@/db";
import { devices } from "@/db/schema";
import { ilike, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const query = db.select().from(devices);

  if (search) {
    query.where(ilike(devices.hostname, `%${search}%`));
  }

  const offset = (page - 1) * limit;
  query.limit(limit).offset(offset);

  const results = await query.execute();
  const countResult = await db.select({ count: sql`count(*)` }).from(devices).execute();

  return NextResponse.json({
    data: results,
    meta: {
      total: countResult[0].count,
      page,
      limit
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  // TODO: Validation with Zod

  const result = await db.insert(devices).values(body).returning();
  return NextResponse.json(result[0]);
}
