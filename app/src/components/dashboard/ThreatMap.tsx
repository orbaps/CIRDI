import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

export function ThreatMap() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Global Threat Origins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full bg-slate-100 rounded-md flex items-center justify-center text-muted-foreground relative overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center" />
          <div className="z-10 text-center">
             <p>Live Attack Map</p>
             <p className="text-xs">Connecting to CrowdSec feed...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
