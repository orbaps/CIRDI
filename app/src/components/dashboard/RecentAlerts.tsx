"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertOctagon, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function RecentAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ["alerts", "recent"],
    queryFn: async () => {
      const res = await axios.get("/api/alerts?limit=5");
      return res.data.data;
    },
    refetchInterval: 15000,
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {data?.map((alert: {
              id: string;
              severity: string;
              title: string;
              device?: { hostname: string };
              sourceIp?: string;
              triggeredAt: string;
            }) => (
              <div key={alert.id} className="flex items-center space-x-4">
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
                  <p className="text-xs text-muted-foreground">
                    {alert.device ? alert.device.hostname : alert.sourceIp || "System"}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true })}
                </div>
              </div>
            ))}
            {data?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
