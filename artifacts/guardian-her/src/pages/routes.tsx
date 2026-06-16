import { useState } from "react";
import { useLocation } from "wouter";
import { useGetSafeRoutes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  Clock,
  Shield,
  ArrowRight,
  MapPin,
  Map as MapIcon,
  Route,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RoutesPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [fastestExpanded, setFastestExpanded] = useState(false);

  const [, setLocation] = useLocation();

  const getRoutes = useGetSafeRoutes();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    getRoutes.mutate({
      data: { origin, destination },
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Safe Route Planner
        </h1>
        <p className="text-muted-foreground">
          Compare routes prioritizing your safety above speed.
        </p>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
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
            <Button
              size="lg"
              className="md:h-auto md:w-32"
              disabled={getRoutes.isPending}
            >
              {getRoutes.isPending ? "Planning..." : "Find Routes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {getRoutes.data && (
        <div className="space-y-6">
          <div className="bg-primary/10 text-primary p-4 rounded-lg flex gap-3 items-start border border-primary/20">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium text-sm leading-relaxed">
              {getRoutes.data.recommendation}
            </p>
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
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Safety Score
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      {getRoutes.data.safestRoute.safetyScore}
                    </p>
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Duration
                    </p>
                    <p className="text-2xl font-bold">
                      {getRoutes.data.safestRoute.duration}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getRoutes.data.safestRoute.highlights.map((h, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-green-500/10 text-green-700 hover:bg-green-500/20"
                      >
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    // Navigates to /guardian and appends ?destination=Sharjah to the URL string
                    setLocation(
                      `/guardian?destination=${encodeURIComponent(destination)}`,
                    );
                  }}
                >
                  Start Guardian Mode
                </Button>
              </CardContent>
            </Card>

            {/* Fastest Route */}
            <Card className={fastestExpanded ? "border-2 border-orange-400 shadow-md" : "opacity-80 hover:opacity-100 transition-opacity"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Route className="w-5 h-5 text-orange-500" />
                  {getRoutes.data.fastestRoute.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Safety Score
                    </p>
                    <p className="text-2xl font-bold text-orange-500">
                      {getRoutes.data.fastestRoute.safetyScore}
                    </p>
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Duration
                    </p>
                    <p className="text-2xl font-bold">
                      {getRoutes.data.fastestRoute.duration}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getRoutes.data.fastestRoute.highlights.map((h, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>

                {fastestExpanded && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3 text-sm text-orange-800 dark:text-orange-300">
                      <p className="font-semibold mb-1 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Safety Advisory
                      </p>
                      <p>This route is faster but passes through 2 lower-lit areas between 9PM–midnight. Consider travelling earlier or enabling Guardian Shadow Mode.</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Route Segments</p>
                      {["Start at current location", "Pass through Main Street (well-lit)", "Turn at Central Crossing (moderate risk after 8PM)", "Arrive at destination"].map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => setFastestExpanded(!fastestExpanded)}>
                    {fastestExpanded ? "Hide Details" : "View Details"}
                  </Button>
                  {fastestExpanded && (
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => setLocation(`/guardian?destination=${encodeURIComponent(destination)}`)}
                    >
                      Start Guardian Mode on This Route
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!getRoutes.data && !getRoutes.isPending && (
        <div className="text-center py-20 text-muted-foreground">
          <MapIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">
            Enter your origin and destination to find the safest route.
          </p>
        </div>
      )}
    </div>
  );
}
