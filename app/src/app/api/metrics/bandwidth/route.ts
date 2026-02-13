import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    let bucketInterval = "1 hour";
    let timeRange = "24 hours";

    switch (range) {
      case "1h":
        bucketInterval = "1 minute";
        timeRange = "1 hour";
        break;
      case "6h":
        bucketInterval = "5 minutes";
        timeRange = "6 hours";
        break;
      case "24h":
        bucketInterval = "15 minutes";
        timeRange = "24 hours";
        break;
      case "7d":
        bucketInterval = "1 hour";
        timeRange = "7 days";
        break;
      case "30d":
        bucketInterval = "1 day";
        timeRange = "30 days";
        break;
    }

    // Using raw SQL for TimescaleDB specific functions
    const query = sql`
      SELECT
        time_bucket(${bucketInterval}::interval, time) AS timestamp,
        COALESCE(AVG(download_bps), 0) / 1000000.0 AS download_mbps,
        COALESCE(AVG(upload_bps), 0) / 1000000.0 AS upload_mbps
      FROM bandwidth_metrics
      WHERE time > NOW() - ${timeRange}::interval
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `;

    const result = await db.execute(query);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        range,
        bucketInterval
      }
    });
  } catch (error) {
    console.error("Metrics API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
