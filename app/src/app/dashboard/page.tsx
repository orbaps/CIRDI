import { Activity, Server, AlertCircle, Shield } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { BandwidthChart } from "@/components/dashboard/BandwidthChart";
import { ThreatMap } from "@/components/dashboard/ThreatMap";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Bandwidth Usage"
          value="45.2 Mbps"
          description="45% of capacity"
          icon={Activity}
          trend="+12%"
          trendUp={true}
        />
        <KPICard
          title="Active Devices"
          value="287"
          description="12 offline"
          icon={Server}
        />
        <KPICard
          title="Active Alerts"
          value="3"
          description="1 critical"
          icon={AlertCircle}
          trend="New"
          trendUp={false}
        />
        <KPICard
          title="Security Events"
          value="12"
          description="Blocked today"
          icon={Shield}
          trend="+2"
          trendUp={false}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <BandwidthChart />
        <ThreatMap />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentAlerts />
        {/* Placeholder for another component, e.g., Top Talkers */}
        <div className="col-span-4 bg-slate-50 rounded-lg p-4 text-center text-muted-foreground border border-dashed flex items-center justify-center">
            Top Talkers Widget (Coming Soon)
        </div>
      </div>
    </div>
  );
}
