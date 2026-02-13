import axios from "axios";
import { db } from "../src/db";
import { bandwidthMetrics, devices } from "../src/db/schema";
import { eq } from "drizzle-orm";
import cron from "node-cron";

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || "http://cirdi-prometheus:9090";

interface PrometheusResponse {
  data: {
    result: Array<{
      metric: {
        instance: string;
        ifDescr: string;
        ifPhysAddress?: string;
        job: string;
      };
      value: [number, string]; // [timestamp, value]
    }>;
  };
}

async function fetchMetric(query: string): Promise<PrometheusResponse['data']['result']> {
  try {
    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
      params: { query },
    });
    return response.data.data.result;
  } catch (error) {
    console.error(`Error fetching metric ${query}:`, error);
    return [];
  }
}

async function syncMetrics() {
  console.log("Syncing metrics from Prometheus...");
  const timestamp = new Date();

  // 1. Fetch relevant metrics
  // We need to join these, but for simplicity in this MVP sync, we'll fetch them separately
  // and correlate by instance + ifDescr in memory.
  // In a real high-scale system, we'd use Prometheus recording rules or stream processing.

  const inOctets = await fetchMetric('rate(ifInOctets[5m]) * 8'); // bits per second
  const outOctets = await fetchMetric('rate(ifOutOctets[5m]) * 8');
  const inErrors = await fetchMetric('rate(ifInErrors[5m])');
  const outErrors = await fetchMetric('rate(ifOutErrors[5m])');

  // 2. Correlate and Insert
  // This map keys by "instance|ifDescr"
  const metricsMap = new Map<string, {
    downloadBps: number;
    uploadBps: number;
    errorsIn: number;
    errorsOut: number;
    instance: string;
    ifDescr: string;
  }>();

  const getKey = (m: any) => `${m.metric.instance}|${m.metric.ifDescr}`;

  inOctets.forEach(m => {
    const key = getKey(m);
    if (!metricsMap.has(key)) metricsMap.set(key, { downloadBps: 0, uploadBps: 0, errorsIn: 0, errorsOut: 0, instance: m.metric.instance, ifDescr: m.metric.ifDescr });
    metricsMap.get(key)!.downloadBps = parseFloat(m.value[1]);
  });

  outOctets.forEach(m => {
    const key = getKey(m);
    if (!metricsMap.has(key)) metricsMap.set(key, { downloadBps: 0, uploadBps: 0, errorsIn: 0, errorsOut: 0, instance: m.metric.instance, ifDescr: m.metric.ifDescr });
    metricsMap.get(key)!.uploadBps = parseFloat(m.value[1]);
  });

  // 3. Resolve Device IDs and Insert
  for (const [key, data] of metricsMap.entries()) {
    // Attempt to find device by IP (instance usually has IP:Port)
    const ip = data.instance.split(':')[0];

    // In a real implementation, we would cache this device lookup
    const device = await db.query.devices.findFirst({
      where: eq(devices.ipAddress, ip)
    });

    let deviceId = null;
    if (device) {
      deviceId = device.id;
    } else {
      // Auto-create unknown device for now (or skip)
      // For this MVP, we'll skip if device not found to enforce discovery first
      // But actually, let's just use a placeholder or create it
      // console.warn(`Device not found for IP ${ip}`);
      continue;
    }

    if (deviceId) {
        await db.insert(bandwidthMetrics).values({
            time: timestamp,
            deviceId: deviceId,
            interfaceName: data.ifDescr,
            downloadBps: Math.round(data.downloadBps),
            uploadBps: Math.round(data.uploadBps),
            downloadBytes: 0, // Rate query doesn't give total bytes, would need raw counter
            uploadBytes: 0,
            errorsIn: Math.round(data.errorsIn),
            errorsOut: Math.round(data.errorsOut)
        });
    }
  }
  console.log(`Synced ${metricsMap.size} interface metrics.`);
}

// Run every 30 seconds
cron.schedule("*/30 * * * * *", () => {
    syncMetrics().catch(console.error);
});

console.log("Metrics sync worker started.");
