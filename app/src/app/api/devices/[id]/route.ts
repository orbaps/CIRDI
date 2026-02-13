import { NextResponse } from "next/server";
import { db } from "@/db";
import { devices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const result = await db.query.devices.findFirst({
    where: eq(devices.id, params.id),
  });

  if (!result) return NextResponse.json({ error: "Device not found" }, { status: 404 });

  // Enrich with bandwidth summary if needed
  // ...

  return NextResponse.json(result);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const result = await db.update(devices)
    .set(body)
    .where(eq(devices.id, params.id))
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await db.delete(devices).where(eq(devices.id, params.id));
  return NextResponse.json({ success: true });
}
