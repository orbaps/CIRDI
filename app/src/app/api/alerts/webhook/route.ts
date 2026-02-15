import { NextResponse } from "next/server";
import { db } from "@/db";
import { alerts, devices } from "@/db/schema";
import { eq } from "drizzle-orm";

interface AlertPayload {
  status: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
}

interface WebhookBody {
  alerts: AlertPayload[];
}

export async function POST(request: Request) {
  try {
    const body: WebhookBody = await request.json();
    console.log("Received alert webhook:", JSON.stringify(body, null, 2));

    for (const alert of body.alerts) {
        const title = alert.annotations.summary || alert.labels.alertname;
        const message = alert.annotations.description || "No description provided";
        const severity = alert.labels.severity || "info";
        const instance = alert.labels.instance;

        // Try to find device
        let deviceId = null;
        if (instance) {
            // Usually instance is "host:port" or "host"
            const ip = instance.split(':')[0];
            const device = await db.query.devices.findFirst({
                where: eq(devices.ipAddress, ip)
            });
            if (device) deviceId = device.id;
        }

        if (alert.status === 'firing') {
            await db.insert(alerts).values({
                type: alert.labels.alertname,
                severity: severity,
                title: title,
                message: message,
                deviceId: deviceId,
                status: 'active',
                triggeredAt: new Date(alert.startsAt)
            });
        } else if (alert.status === 'resolved') {
             // In a real system, we'd update the existing alert to resolved
             // For now, we'll just log it or maybe insert a resolution record
             await db.update(alerts)
                .set({ status: 'resolved', resolvedAt: new Date() })
                .where(eq(alerts.type, alert.labels.alertname)); // This is too broad, should match device/instance too
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
