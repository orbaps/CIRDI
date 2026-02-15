import "./scripts/sync-metrics";
import "./scripts/discover-devices";
import "./scripts/ingest-suricata";

console.log("CIRDI Worker Service Started.");
console.log("Modules loaded: sync-metrics, discover-devices, ingest-suricata");

// Keep the process alive
setInterval(() => {}, 60000);
