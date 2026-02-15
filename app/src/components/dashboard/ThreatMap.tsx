"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function ThreatMap() {
  const { data, isLoading } = useQuery({
    queryKey: ["security", "events"],
    queryFn: async () => {
      const res = await axios.get("/api/security/events?limit=20");
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Global Threat Origins
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-[300px] w-full bg-slate-50 rounded-md overflow-hidden relative">
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#EAEAEC"
                      stroke="#D6D6DA"
                    />
                  ))
                }
              </Geographies>
              {/* Visualize threat sources if GeoIP data is available */}
              {data?.map((event: { src_country: string }, i: number) => {
                 // Mock coordinates if GeoIP is missing for demo
                 // In production, we'd use lat/long from GeoIP database
                 const coordinates = event.src_country === 'CN' ? [104.1, 35.8] :
                                     event.src_country === 'RU' ? [105.3, 61.5] :
                                     event.src_country === 'US' ? [-95.7, 37.0] : [0, 0];

                 if (coordinates[0] === 0) return null;

                 return (
                    <Marker key={i} coordinates={coordinates as [number, number]}>
                      <circle r={4} fill="#EF4444" stroke="#fff" strokeWidth={1} />
                    </Marker>
                 );
              })}
            </ComposableMap>
            <div className="absolute bottom-2 right-2 bg-white/80 p-2 rounded text-xs">
               <span className="font-bold">{data?.length || 0}</span> events detected
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
