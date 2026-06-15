import { useState } from "react";
import { useGetSafeRoutes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navigation, Clock, Shield, ArrowRight, MapPin, Map as MapIcon, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RoutesPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  
  const getRoutes = useGetSafeRoutes();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    getRoutes.mutate({
      data: { origin, destination }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Safe Route Planner</h1>
        <p className="text-muted-foreground">Compare routes prioritizing your safety above speed.</p>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Starting point" 
                  className="pl-10 h-12"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Destination" 
                  className="pl-10 h-12"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
            <Button size="lg" className="md:h-auto md:w-32" disabled={getRoutes.isPending}>
              {getRoutes.isPending ? "Planning..." : "Find Routes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {getRoutes.data && (
        <div className="space-y-6">
          <div className="bg-primary/10 text-primary p-4 rounded-lg flex gap-3 items-start border border-primary/20">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium text-sm leading-relaxed">{getRoutes.data.recommendation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safest Route */}
            <Card className="border-2 border-green-500 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                RECOMMENDED
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  {getRoutes.data.safestRoute.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Safety Score</p>
                    <p className="text-2xl font-bold text-green-500">{getRoutes.data.safestRoute.safetyScore}</p>
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Duration</p>
                    <p className="text-2xl font-bold">{getRoutes.data.safestRoute.duration}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {getRoutes.data.safestRoute.highlights.map((h, i) => (
                      <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Start Guardian Mode</Button>
              </CardContent>
            </Card>

            {/* Fastest Route */}
            <Card className="opacity-80 hover:opacity-100 transition-opacity">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Route className="w-5 h-5 text-muted-foreground" />
                  {getRoutes.data.fastestRoute.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Safety Score</p>
                    <p className="text-2xl font-bold text-orange-500">{getRoutes.data.fastestRoute.safetyScore}</p>
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Duration</p>
                    <p className="text-2xl font-bold">{getRoutes.data.fastestRoute.duration}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {getRoutes.data.fastestRoute.highlights.map((h, i) => (
                      <Badge key={i} variant="outline" className="text-muted-foreground">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">View Details</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!getRoutes.data && !getRoutes.isPending && (
        <div className="text-center py-20 text-muted-foreground">
          <MapIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Enter your origin and destination to find the safest route.</p>
        </div>
      )}
    </div>
  );
}
