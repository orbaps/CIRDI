import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Using raw SQL for efficient querying of hypertable
    const query = sql`
      SELECT
        time,
        event_id,
        event_type,
        alert_severity,
        alert_signature,
        src_ip,
        src_country,
        dest_ip
      FROM security_events
      ORDER BY time DESC
      LIMIT ${limit}
    `;

    const results = await db.execute(query);

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Security API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
