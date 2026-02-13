import axios from "axios";
import { db } from "../src/db";
import { devices } from "../src/db/schema";
import { eq } from "drizzle-orm";
import cron from "node-cron";

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || "http://cirdi-prometheus:9090";

interface Target {
    instance: string;
    job: string;
    labels: {
        instance: string;
        job: string;
    };
    health: string;
    scrapeUrl: string;
}

// Simple discovery based on Prometheus targets
// In a real system, we'd use snmp-scan or arp-scan
async function discoverDevices() {
    console.log("Discovering devices via Prometheus targets...");

    try {
        const response = await axios.get(`${PROMETHEUS_URL}/api/v1/targets`);
        const targets: Target[] = response.data.data.activeTargets;

        for (const target of targets) {
            // We only care about SNMP-scraped targets for now
            if (target.labels.job !== 'snmp') continue;

            // Extract IP (instance usually includes port)
            const ip = target.labels.instance.split(':')[0];

            // Check if device exists
            const existing = await db.query.devices.findFirst({
                where: eq(devices.ipAddress, ip)
            });

            if (!existing) {
                console.log(`Discovered new device: ${ip}`);
                await db.insert(devices).values({
                    ipAddress: ip,
                    hostname: target.labels.instance, // Placeholder hostname
                    deviceType: 'router',
                    status: target.health === 'up' ? 'online' : 'offline',
                    discoveryMethod: 'prometheus_target',
                    snmpCommunity: 'public', // Default
                    monitorBandwidth: true
                });
            } else {
                // Update status
                if (existing.status !== (target.health === 'up' ? 'online' : 'offline')) {
                     await db.update(devices)
                        .set({
                            status: target.health === 'up' ? 'online' : 'offline',
                            lastSeen: new Date()
                        })
                        .where(eq(devices.id, existing.id));
                }
            }
        }
    } catch (error) {
        console.error("Discovery error:", error);
    }
}

// Run every minute
cron.schedule("* * * * *", () => {
    discoverDevices().catch(console.error);
});

console.log("Device discovery worker started.");
