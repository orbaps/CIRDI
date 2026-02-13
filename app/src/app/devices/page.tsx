"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DevicesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["devices", search],
    queryFn: async () => {
      const res = await axios.get(`/api/devices?search=${search}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Devices</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Inventory</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostname</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((device: {
                  id: string;
                  hostname: string;
                  ipAddress: string;
                  status: string;
                  deviceType: string;
                  lastSeen: string;
                }) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.hostname}</TableCell>
                    <TableCell>{device.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant={device.status === "online" ? "default" : "destructive"}>
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{device.deviceType}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No devices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
