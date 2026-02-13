"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Loader2 } from "lucide-react";

export function BandwidthChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["bandwidth", "24h"],
    queryFn: async () => {
      const res = await axios.get("/api/metrics/bandwidth?range=24h");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Network Traffic (Last 24 Hours)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  minTickGap={30}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number | undefined) => [value ? `${value.toFixed(2)} Mbps` : "0 Mbps", ""]}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
                <Area
                  type="monotone"
                  dataKey="download_mbps"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorDownload)"
                  name="Download"
                />
                <Area
                  type="monotone"
                  dataKey="upload_mbps"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorUpload)"
                  name="Upload"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
