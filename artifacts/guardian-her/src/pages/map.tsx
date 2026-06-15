import { useState } from "react";
import { useGetCommunityReports, useGetSafetyHeatmap, useGetNearbySafeSpaces } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Shield, AlertCircle, Building2, Search } from "lucide-react";

export function MapPage() {
  const [location, setLocation] = useState("San Francisco, CA");
  const [searchLocation, setSearchLocation] = useState("");

  const { data: reports } = useGetCommunityReports();
  const heatmap = useGetSafetyHeatmap();
  const safeSpaces = useGetNearbySafeSpaces();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation) return;
    setLocation(searchLocation);
    heatmap.mutate({ data: { location: searchLocation } });
    safeSpaces.mutate({ data: { location: searchLocation } });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Safety Map</h1>
        <p className="text-muted-foreground">Community-driven safety insights and safe spaces.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search neighborhood or city..." 
            className="pl-9 h-12"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
        </div>
        <Button size="lg" className="h-12" disabled={heatmap.isPending || safeSpaces.isPending}>
          Search
        </Button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-muted/30 border rounded-xl overflow-hidden relative min-h-[400px]">
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/5">
            <MapPin className="w-16 h-16 text-primary/20 mb-4" />
            <p className="text-muted-foreground font-medium">Interactive Map Visualization</p>
            <p className="text-sm text-muted-foreground/70 text-center max-w-sm mt-2">
              Showing {location}. Heatmap zones and safe spaces would be rendered here.
            </p>
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <Tabs defaultValue="reports" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4 shrink-0">
              <TabsTrigger value="reports">Community Reports</TabsTrigger>
              <TabsTrigger value="spaces">Safe Spaces</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
              {reports?.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="capitalize text-xs font-semibold">
                        {report.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mt-2 mb-2 font-medium">{report.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {report.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="spaces" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
              {safeSpaces.data ? (
                safeSpaces.data.map((space) => (
                  <Card key={space.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          {space.name}
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {space.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{space.address}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium">{space.distance}</span>
                        {space.isOpen ? (
                          <span className="text-green-600 font-medium">Open Now</span>
                        ) : (
                          <span className="text-destructive font-medium">Closed</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>Search a location to find nearby safe spaces.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
