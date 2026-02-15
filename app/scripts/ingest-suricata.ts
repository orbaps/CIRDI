import { Tail } from "tail";
import { db } from "../src/db";
import { securityEvents } from "../src/db/schema";
import fs from "fs";

const SURICATA_LOG_PATH = "/var/log/suricata/eve.json";

// In production, this file is mounted from the Suricata container volume
// For development, we might need to mock it or check if it exists
if (!fs.existsSync(SURICATA_LOG_PATH)) {
    console.warn(`Suricata log file not found at ${SURICATA_LOG_PATH}. Security ingestion disabled.`);
} else {
    console.log(`Watching Suricata log at ${SURICATA_LOG_PATH}...`);
    const tail = new Tail(SURICATA_LOG_PATH);

    tail.on("line", async (data) => {
        try {
            const event = JSON.parse(data);

            // Only process alerts for now
            if (event.event_type !== 'alert') return;

            const severity = event.alert?.severity || 3;
            const signature = event.alert?.signature || "Unknown Alert";
            const srcIp = event.src_ip;
            const destIp = event.dest_ip;

            // Simple GeoIP mock (since we don't have the MMDB in this container yet)
            // In a real setup, we'd use 'maxmind' library here

            await db.insert(securityEvents).values({
                time: new Date(event.timestamp),
                eventId: event.flow_id ? event.flow_id.toString() : Math.random().toString(),
                eventType: event.event_type,
                alertSeverity: severity,
                alertSignature: signature,
                srcIp: srcIp,
                destIp: destIp,
                srcPort: event.src_port,
                destPort: event.dest_port,
                proto: event.proto,
                action: event.alert?.action || "allowed",
                rawEvent: event
            });

            console.log(`Ingested security event: ${signature} from ${srcIp}`);

        } catch (error) {
            console.error("Error processing Suricata log line:", error);
        }
    });

    tail.on("error", (error) => {
        console.error("Tail error:", error);
    });
}
