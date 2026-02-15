import { NextResponse } from "next/server";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  const results = await db.query.alerts.findMany({
    orderBy: [desc(alerts.triggeredAt)],
    limit: limit,
    with: {
        device: true
    }
  });

  return NextResponse.json({ data: results });
}
