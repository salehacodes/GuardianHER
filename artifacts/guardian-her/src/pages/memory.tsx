import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, MapPin, AlertTriangle, Shield, TrendingUp, Clock,
  TriangleAlert, Route, RefreshCw, Lightbulb, Archive
} from "lucide-react";

type Pattern = {
  id: string; title: string; description: string; frequency: number;
  category: string; severity: "high" | "medium" | "low";
  affectedLocations: string[]; timePattern: string; recommendation: string;
};
type Warning = { id: string; message: string; location: string; severity: "high" | "medium" | "low"; action: string };
type RouteSuggestion = { id: string; title: string; description: string; type: "avoid" | "use" };
type MemoryInsights = {
  totalIncidents: number; patterns: Pattern[]; warnings: Warning[];
  routeSuggestions: RouteSuggestion[]; safetyScore: number; summary: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchInsights(): Promise<MemoryInsights> {
  const res = await fetch(`${BASE}/api/memory/insights`);
  if (!res.ok) throw new Error("Failed to load memory insights");
  return res.json();
}

const severityColor = (s: string) => {
  if (s === "high") return "bg-red-500 text-white";
  if (s === "medium") return "bg-orange-400 text-white";
  return "bg-yellow-400 text-yellow-950";
};

const severityBorder = (s: string) => {
  if (s === "high") return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
  if (s === "medium") return "border-l-orange-400 bg-orange-50 dark:bg-orange-950/20";
  return "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/20";
};

const scoreColor = (score: number) => {
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-orange-400";
  return "text-red-500";
};

export function Memory() {
  const { toast } = useToast();
  const [refetchKey, setRefetchKey] = useState(0);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["memory-insights", refetchKey],
    queryFn: fetchInsights,
    staleTime: 1000 * 60 * 5,
  });

  const handleRefresh = () => {
    setRefetchKey((k) => k + 1);
    refetch();
    toast({ title: "Analyzing patterns...", description: "AI is scanning your incident history." });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Archive className="w-8 h-8 text-primary" />
            Memory Capsule
          </h1>
          <p className="text-muted-foreground mt-1">
            AI learns from your personal safety history to protect you better over time.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isFetching || isLoading}>
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Re-analyze
        </Button>
      </div>

      {isLoading || isFetching ? (
        <div className="space-y-6">
          <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />)}
          </div>
          <div className="h-48 bg-muted/40 rounded-xl animate-pulse" />
          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Brain className="w-4 h-4 animate-pulse text-primary" />
            AI is analyzing your incident history for patterns...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Summary hero */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/30" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray={`${data.safetyScore} 100`} strokeLinecap="round"
                      className={scoreColor(data.safetyScore)} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${scoreColor(data.safetyScore)}`}>{data.safetyScore}</span>
                    <span className="text-[10px] text-muted-foreground">Safety</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-semibold">AI Analysis Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Archive className="w-4 h-4" />
                      <span><strong className="text-foreground">{data.totalIncidents}</strong> total incidents analyzed</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span><strong className="text-foreground">{data.patterns.length}</strong> patterns found</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {data.warnings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TriangleAlert className="w-5 h-5 text-orange-500" /> AI Warnings
              </h2>
              <div className="space-y-3">
                {data.warnings.map((w) => (
                  <div key={w.id} className={`border-l-4 rounded-r-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${severityBorder(w.severity)}`}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{w.message}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {w.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={severityColor(w.severity)}>{w.severity}</Badge>
                      <span className="text-xs text-muted-foreground capitalize">{w.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {data.patterns.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Identified Patterns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.patterns.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${p.severity === "high" ? "bg-red-500" : p.severity === "medium" ? "bg-orange-400" : "bg-yellow-400"}`} />
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{p.title}</CardTitle>
                        <Badge className={`${severityColor(p.severity)} shrink-0`}>{p.severity}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {p.frequency}x reported
                        </span>
                        {p.timePattern && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {p.timePattern}
                          </span>
                        )}
                      </div>
                      {p.affectedLocations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.affectedLocations.map((loc, i) => (
                            <span key={i} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-muted rounded-full">
                              <MapPin className="w-2.5 h-2.5" /> {loc}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 border-t border-border/60">
                        <p className="text-xs font-medium flex items-start gap-1.5 text-primary">
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {p.recommendation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Route suggestions */}
          {data.routeSuggestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" /> AI Route Suggestions
              </h2>
              <div className="space-y-3">
                {data.routeSuggestions.map((r) => (
                  <div key={r.id} className={`flex gap-4 p-4 rounded-xl border ${r.type === "avoid" ? "border-red-200 bg-red-50 dark:bg-red-950/20" : "border-green-200 bg-green-50 dark:bg-green-950/20"}`}>
                    <div className={`p-2 rounded-full shrink-0 ${r.type === "avoid" ? "bg-red-100 dark:bg-red-900/40" : "bg-green-100 dark:bg-green-900/40"}`}>
                      {r.type === "avoid"
                        ? <TriangleAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                        : <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                    </div>
                    <Badge variant="outline" className={`ml-auto shrink-0 self-start capitalize ${r.type === "avoid" ? "border-red-300 text-red-600" : "border-green-400 text-green-700"}`}>
                      {r.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.patterns.length === 0 && data.warnings.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-60" />
                <p className="text-lg font-medium">No concerning patterns detected</p>
                <p className="text-sm mt-2">Keep logging incidents as they happen — the AI learns and protects better over time.</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
