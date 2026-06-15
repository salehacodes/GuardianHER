import { useState } from "react";
import { useGetCommunityReports, useGetSafetyHeatmap, useGetNearbySafeSpaces } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Shield, Heart, Pill, Users, Home, Search, Navigation, Phone, Star } from "lucide-react";

export function MapPage() {
  const [location, setLocation] = useState("San Francisco, CA");
  const [searchLocation, setSearchLocation] = useState("");
  const [spacesFilter, setSpacesFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");

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

  const getSpaceIcon = (type: string) => {
    switch(type) {
      case 'police': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'hospital': return <Heart className="w-5 h-5 text-red-500" />;
      case 'pharmacy': return <Pill className="w-5 h-5 text-green-500" />;
      case 'womens_center': return <Users className="w-5 h-5 text-purple-500" />;
      case 'shelter': return <Home className="w-5 h-5 text-orange-500" />;
      default: return <Shield className="w-5 h-5 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-500 border-red-200';
      case 'medium': return 'bg-orange-500 border-orange-200';
      case 'low': return 'bg-yellow-500 border-yellow-200 text-yellow-950';
      default: return 'bg-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Safety Map & Spaces</h1>
        <p className="text-muted-foreground">Community-driven safety insights and verified safe locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <Card className="bg-primary/5 border-primary/20 shrink-0">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                  <Input 
                    placeholder="Search neighborhood or city to find safe spaces..." 
                    className="pl-10 h-12 bg-background border-primary/10 shadow-sm"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <Button size="lg" className="h-12 px-8 font-semibold shadow-sm" disabled={heatmap.isPending || safeSpaces.isPending}>
                  Locate
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-muted/30 border rounded-xl overflow-hidden relative flex-1 min-h-[300px]">
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/5">
              <MapPin className="w-16 h-16 text-primary/20 mb-4" />
              <p className="text-muted-foreground font-medium text-lg">Interactive Map View</p>
              <p className="text-sm text-muted-foreground/70 text-center max-w-sm mt-2">
                Currently viewing: <span className="font-semibold">{location}</span>
                <br/>Map renders realtime heatmap zones and safe space markers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <Tabs defaultValue="spaces" className="flex-1 flex flex-col h-full">
            <TabsList className="grid grid-cols-3 mb-4 shrink-0">
              <TabsTrigger value="spaces">Safe Spaces</TabsTrigger>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spaces" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 mb-2">
                {['all', 'police', 'hospital', 'pharmacy', 'womens_center', 'shelter'].map(type => (
                  <Badge 
                    key={type}
                    variant={spacesFilter === type ? 'default' : 'outline'}
                    className="cursor-pointer capitalize whitespace-nowrap"
                    onClick={() => setSpacesFilter(type)}
                  >
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
              </div>

              {safeSpaces.data ? (
                safeSpaces.data
                  .filter(space => spacesFilter === 'all' || space.type === spacesFilter)
                  .map((space) => (
                  <Card key={space.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className="p-2 bg-muted rounded-lg shrink-0">
                            {getSpaceIcon(space.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold leading-tight">{space.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                                {space.type.replace('_', ' ')}
                              </Badge>
                              {space.isOpen ? (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">OPEN</span>
                              ) : (
                                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm">CLOSED</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{space.address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            <span className="font-medium text-foreground">{space.distance}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            4.8
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-2">
                          <Navigation className="w-3 h-3" /> Route
                        </Button>
                        <Button size="sm" variant="default" className="flex-1 gap-2 bg-primary/90">
                          <Phone className="w-3 h-3" /> Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium mb-1">Find Safe Spaces</p>
                  <p className="text-sm">Search your location to see verified safe havens nearby.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="heatmap" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
              {heatmap.data ? (
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        AI Safety Forecast
                      </h4>
                      <p className="text-sm">{heatmap.data.forecast}</p>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Zone Risk Levels</h4>
                    <div className="space-y-3">
                      {heatmap.data.zones.map((zone: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{zone.name}</span>
                            <span className="capitalize">{zone.riskLevel} Risk</span>
                          </div>
                          <div className="h-2 rounded-full w-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${zone.riskLevel === 'high' ? 'bg-red-500' : zone.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                              style={{ width: `${zone.riskLevel === 'high' ? 85 : zone.riskLevel === 'medium' ? 50 : 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Peak Risk Hours</h4>
                    <div className="flex flex-wrap gap-2">
                      {heatmap.data.peakRiskHours.map((hour: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-orange-200 bg-orange-50 text-orange-800">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Search a location to generate the safety heatmap.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reports" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 mb-2">
                {['all', 'high', 'medium', 'low'].map(severity => (
                  <Badge 
                    key={severity}
                    variant={reportFilter === severity ? 'default' : 'outline'}
                    className="cursor-pointer capitalize whitespace-nowrap"
                    onClick={() => setReportFilter(severity)}
                  >
                    {severity}
                  </Badge>
                ))}
              </div>

              {reports?.map((report) => (
                <Card key={report.id} className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
                  <div className={`h-1.5 w-full ${getSeverityColor(report.severity)}`} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="capitalize text-xs font-semibold">
                        {report.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mt-2 mb-3 font-medium text-foreground/90">{report.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {report.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
          </Tabs>
        </div>
      </div>
    </div>
  );
}
