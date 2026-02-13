import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    title: "High Bandwidth Usage",
    device: "GigabitEthernet0/1",
    severity: "warning",
    time: "2 mins ago",
  },
  {
    title: "Port Scan Detected",
    device: "External Interface",
    severity: "critical",
    time: "15 mins ago",
  },
  {
    title: "New Device Found",
    device: "iPhone-14-Pro",
    severity: "info",
    time: "1 hour ago",
  },
];

export function RecentAlerts() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div
                className={cn(
                  "p-2 rounded-full",
                  alert.severity === "critical"
                    ? "bg-red-100 text-red-600"
                    : alert.severity === "warning"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                )}
              >
                {alert.severity === "critical" ? (
                  <AlertOctagon className="h-4 w-4" />
                ) : alert.severity === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.device}</p>
              </div>
              <div className="text-xs text-muted-foreground">{alert.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
