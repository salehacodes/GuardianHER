import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGetSafeRoutes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSos } from "@/context/sos-context";
import {
  Navigation, Clock, Shield, MapPin, Map as MapIcon, Route,
  Brain, TrendingUp, Users, Zap, CloudRain, AlertTriangle,
  Lightbulb, Eye, CheckCircle, ShieldCheck, AlertOctagon
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type RiskFactor = { factor: string; impact: "high" | "medium" | "low"; detail: string; icon: string };
type SafetyBubble = {
  corridorName: string; corridorDescription: string; bubbleRadius: string;
  activeThreats: string[]; safeZones: string[]; dangerZones: string[];
  instruction: string;
};
type DangerPrediction = {
  riskScore: number; riskLevel: string; riskTrend: string; trendReason: string;
  reasons: RiskFactor[]; safetyBubble: SafetyBubble;
  timeAnalysis: string; recommendation: string; alternativeTime: string;
};

async function fetchDangerPrediction(body: {
  origin: string; destination: string; departureTime: string;
}): Promise<DangerPrediction> {
  const res = await fetch(`${BASE}/api/danger-prediction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

const factorIcon = (icon: string) => {
  switch (icon) {
    case "crowd": return <Users className="w-4 h-4" />;
    case "lighting": return <Zap className="w-4 h-4" />;
    case "weather": return <CloudRain className="w-4 h-4" />;
    case "incidents": return <AlertTriangle className="w-4 h-4" />;
    case "time": return <Clock className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const impactColor = (impact: string) => {
  if (impact === "high") return "text-red-500 bg-red-500/10";
  if (impact === "medium") return "text-orange-400 bg-orange-400/10";
  return "text-yellow-500 bg-yellow-500/10";
};

const riskColor = (score: number) => {
  if (score >= 70) return { text: "text-red-500", bg: "bg-red-500", glow: "shadow-red-500/30" };
  if (score >= 45) return { text: "text-orange-400", bg: "bg-orange-400", glow: "shadow-orange-400/30" };
  return { text: "text-green-500", bg: "bg-green-500", glow: "shadow-green-500/30" };
};

// Hardcoded detour points for the map mockup
const DETOUR_POINTS = [
  { x: 25, y: 68, color: "#3b82f6", label: "Safe bypass", risk: "safe" },
  { x: 48, y: 52, color: "#eab308", label: "Moderate area", risk: "moderate" },
  { x: 62, y: 40, color: "#ef4444", label: "High risk zone", risk: "danger" },
  { x: 75, y: 30, color: "#3b82f6", label: "Well-lit route", risk: "safe" },
  { x: 35, y: 58, color: "#eab308", label: "Low foot traffic", risk: "moderate" },
];

function GuardianMapMockup({ origin, destination }: { origin: string; destination: string }) {
  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden border border-blue-500/30 bg-slate-900">
      {/* Map grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 11.1}%`} y1="0" x2={`${i * 11.1}%`} y2="100%" stroke="#94a3b8" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 14.28}%`} x2="100%" y2={`${i * 14.28}%`} stroke="#94a3b8" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Route line + branch lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>
        {/* Main route */}
        <line
          x1="10%" y1="82%" x2="90%" y2="15%"
          stroke="#3b82f6" strokeWidth="3" strokeDasharray="10 4"
          markerEnd="url(#arrowhead)"
          opacity="0.8"
        />
        {/* Branch lines — start ON the main route, peel off to each detour dot */}
        {/* dot (25,68) safe/blue  — branch from route point (22, 71.9) */}
        <line x1="22%" y1="71.9%" x2="25%" y2="68%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
        {/* dot (35,58) moderate/yellow — branch from route point (33, 62.7) */}
        <line x1="33%" y1="62.7%" x2="35%" y2="58%" stroke="#eab308" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
        {/* dot (48,52) moderate/yellow — branch from route point (43, 54.4) */}
        <line x1="43%" y1="54.4%" x2="48%" y2="52%" stroke="#eab308" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
        {/* dot (62,40) danger/red — branch from route point (57, 42.6) */}
        <line x1="57%" y1="42.6%" x2="62%" y2="40%" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
        {/* dot (75,30) safe/blue — branch from route point (70, 31.8) */}
        <line x1="70%" y1="31.8%" x2="75%" y2="30%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
      </svg>

      {/* Detour points */}
      {DETOUR_POINTS.map((pt, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center gap-0.5"
          style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div
            className="w-3 h-3 rounded-full border-2 border-white/30 shadow-lg"
            style={{ backgroundColor: pt.color }}
          />
        </div>
      ))}

      {/* Current location dot (pulsing) */}
      <div className="absolute" style={{ left: "38%", top: "60%", transform: "translate(-50%, -50%)" }}>
        <div className="relative">
          <div className="absolute inset-0 w-5 h-5 rounded-full bg-blue-400/40 animate-ping" />
          <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Origin label */}
      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
        <MapPin className="w-2.5 h-2.5 text-green-400" />
        {origin || "Start"}
      </div>

      {/* Destination label */}
      <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
        <Navigation className="w-2.5 h-2.5 text-blue-400" />
        {destination || "Destination"}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-black/60 rounded-md px-2 py-1.5 space-y-1">
        {[
          { color: "#3b82f6", label: "Safe" },
          { color: "#eab308", label: "Moderate" },
          { color: "#ef4444", label: "Danger" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-[9px] text-white/70">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoutesPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [fastestExpanded, setFastestExpanded] = useState(false);
  const [guardianActive, setGuardianActive] = useState(false);
  const [guardianDest, setGuardianDest] = useState("");

  const { activateSos } = useSos();
  const getRoutes = useGetSafeRoutes();
  const prediction = useMutation({ mutationFn: fetchDangerPrediction });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    getRoutes.mutate({ data: { origin, destination } });
    prediction.mutate({ origin, destination, departureTime });
  };

  const startGuardianMode = (dest: string) => {
    setGuardianDest(dest || destination);
    setGuardianActive(true);
  };

  const endGuardianMode = () => {
    setGuardianActive(false);
    setGuardianDest("");
  };

  const pred = prediction.data;
  const colors = pred ? riskColor(pred.riskScore) : null;

  // ─── GUARDIAN ACTIVE VIEW ───
  if (guardianActive) {
    return (
      <div className="space-y-0 max-w-5xl mx-auto">
        {/* Banner */}
        <div className="rounded-xl overflow-hidden border border-green-500/40 bg-green-950/30 mb-5">
          <div className="flex items-center gap-4 px-5 py-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
                <div className="w-3 h-3 rounded-full bg-green-500 relative" />
              </div>
              <div>
                <p className="text-green-300 font-black text-base uppercase tracking-wide">Guardian Mode Active</p>
                <p className="text-green-400/70 text-xs">Tracking journey to <span className="font-semibold text-green-300">{guardianDest}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white gap-1.5 font-semibold"
                onClick={endGuardianMode}
              >
                <ShieldCheck className="w-4 h-4" /> I'm Safe
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5 font-semibold"
                onClick={() => { activateSos(); endGuardianMode(); }}
              >
                <AlertOctagon className="w-4 h-4" /> I Need Help
              </Button>
            </div>
          </div>
        </div>

        {/* Map mockup */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary" /> Live Route Map
          </h2>
          <GuardianMapMockup origin={origin} destination={guardianDest} />

          {/* Detour legend */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { color: "bg-blue-500", label: "Safe detour", desc: "Well-lit, monitored path" },
              { color: "bg-yellow-500", label: "Moderate risk", desc: "Low foot traffic area" },
              { color: "bg-red-500", label: "High risk zone", desc: "Avoid if possible" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white/50 shrink-0" />
            <span>Blue dot marks your current position on the route</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── NORMAL ROUTES VIEW ───
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Safe Route Planner</h1>
        <p className="text-muted-foreground">AI-powered danger prediction + safety corridor for every journey.</p>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Starting point" className="pl-10 h-12"
                  value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Destination" className="pl-10 h-12"
                  value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="time" className="pl-10 h-12"
                  value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
              </div>
            </div>
            <Button size="lg" className="w-full h-12 font-semibold" disabled={getRoutes.isPending || prediction.isPending}>
              {getRoutes.isPending || prediction.isPending ? "Analyzing Route..." : "Predict Danger & Find Routes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ─── AI DANGER PREDICTION ─── */}
      {prediction.isPending && (
        <Card className="border-orange-400/40 bg-orange-950/10 animate-pulse">
          <CardContent className="p-6 flex items-center gap-4">
            <Brain className="w-8 h-8 text-orange-400 animate-bounce" />
            <div>
              <p className="font-semibold text-orange-300">AI Danger Prediction Engine running...</p>
              <p className="text-sm text-muted-foreground">Analyzing crowd density, lighting, incident history, time patterns</p>
            </div>
          </CardContent>
        </Card>
      )}

      {pred && colors && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Risk Score Hero */}
          <Card className={`border-2 ${pred.riskScore >= 70 ? "border-red-500/50" : pred.riskScore >= 45 ? "border-orange-400/50" : "border-green-500/50"} overflow-hidden`}>
            <div className={`h-1.5 w-full ${colors.bg}`} />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Gauge */}
                <div className="relative shrink-0">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/20" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                      strokeDasharray={`${pred.riskScore} 100`} strokeLinecap="round"
                      className={colors.text} style={{ transition: "stroke-dasharray 1s ease" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${colors.text}`}>{pred.riskScore}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold capitalize">{pred.riskLevel} Risk</h3>
                    <Badge className={`gap-1.5 ${pred.riskTrend === "increasing" ? "bg-red-500" : pred.riskTrend === "decreasing" ? "bg-green-500" : "bg-yellow-500 text-yellow-950"}`}>
                      <TrendingUp className="w-3 h-3" />
                      {pred.riskTrend === "increasing" ? "Becoming more dangerous" : pred.riskTrend === "decreasing" ? "Risk decreasing" : "Risk stable"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pred.trendReason}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {pred.alternativeTime && (
                      <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Safer time: <strong>{pred.alternativeTime}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pred.reasons.map((r, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                    <div className={`p-1.5 rounded-lg shrink-0 ${impactColor(r.impact)}`}>
                      {factorIcon(r.icon)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.factor}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
                    </div>
                    <Badge variant="outline" className={`ml-auto self-start text-[10px] capitalize shrink-0 ${impactColor(r.impact)}`}>
                      {r.impact}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Time analysis + recommendation */}
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <div className="flex gap-2 text-sm p-3 bg-muted/30 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{pred.timeAnalysis}</p>
                </div>
                <div className="flex gap-2 text-sm p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="font-medium">{pred.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Bubble */}
          <Card className="border-blue-400/40 bg-blue-950/10 overflow-hidden">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-400">
                <Eye className="w-5 h-5" /> AI Safety Bubble
                <Badge className="bg-blue-500 text-white ml-auto text-xs">Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-5">
              <div className="relative h-32 bg-blue-950/20 rounded-xl overflow-hidden border border-blue-400/20 flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full border-2 border-blue-400/30 animate-ping" />
                <div className="absolute w-16 h-16 rounded-full border-2 border-blue-400/50 animate-pulse" />
                <div className="absolute w-10 h-10 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-300" />
                </div>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-blue-400/10 border-y border-blue-400/20" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-300 font-medium opacity-70">
                  {pred.safetyBubble.bubbleRadius} radius
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-sm text-blue-300">{pred.safetyBubble.corridorName}</p>
                <p className="text-sm text-muted-foreground">{pred.safetyBubble.corridorDescription}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {pred.safetyBubble.instruction}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {pred.safetyBubble.safeZones.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-green-500">Safe Zones</p>
                    {pred.safetyBubble.safeZones.map((z, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {z}
                      </div>
                    ))}
                  </div>
                )}
                {pred.safetyBubble.dangerZones.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500">Danger Zones</p>
                    {pred.safetyBubble.dangerZones.map((z, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" /> {z}
                      </div>
                    ))}
                  </div>
                )}
                {pred.safetyBubble.activeThreats.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">Active Threats</p>
                    {pred.safetyBubble.activeThreats.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── ROUTES ─── */}
      {getRoutes.data && (
        <div className="space-y-6">
          <div className="bg-primary/10 text-primary p-4 rounded-lg flex gap-3 items-start border border-primary/20">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium text-sm leading-relaxed">{getRoutes.data.recommendation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safest Route */}
            <Card className="border-2 border-green-500 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">RECOMMENDED</div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  {getRoutes.data.safestRoute.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
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
                <div className="flex flex-wrap gap-2">
                  {getRoutes.data.safestRoute.highlights.map((h, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">{h}</Badge>
                  ))}
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => startGuardianMode(destination)}
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
              <CardContent className="space-y-5">
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
                <div className="flex flex-wrap gap-2">
                  {getRoutes.data.fastestRoute.highlights.map((h, i) => (
                    <Badge key={i} variant="outline" className="text-muted-foreground">{h}</Badge>
                  ))}
                </div>

                {fastestExpanded && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3 text-sm text-orange-800 dark:text-orange-300">
                      <p className="font-semibold mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> Safety Advisory</p>
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
                      onClick={() => startGuardianMode(destination)}
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

      {!getRoutes.data && !getRoutes.isPending && !prediction.isPending && (
        <div className="text-center py-20 text-muted-foreground">
          <MapIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Enter your journey details above</p>
          <p className="text-sm mt-1">AI will predict real-time danger and plan the safest corridor for you.</p>
        </div>
      )}
    </div>
  );
}
