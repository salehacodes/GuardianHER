import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetDashboardSummary, useGetRecentAlerts } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSos } from "@/context/sos-context";
import {
  Shield, AlertTriangle, Clock, MapPin, Navigation, Bot,
  PhoneIncoming, Map, Archive, Radio, X, ChevronDown, ChevronUp
} from "lucide-react";

type LocationState = { city: string; coords: string; loading: boolean; error: string | null };

const QUICK_ACCESS = [
  { href: "/map", label: "Safety Map", icon: Map, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", desc: "View heatmap & safe spaces" },
  { href: "/routes", label: "Safe Routes", icon: Navigation, color: "bg-green-500/10 text-green-600 dark:text-green-400", desc: "Plan your journey" },
  { href: "/fake-call", label: "Fake Call", icon: PhoneIncoming, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400", desc: "Escape situations" },
  { href: "/assistant", label: "AI Assistant", icon: Bot, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", desc: "Get safety guidance" },
];

export function Dashboard() {
  const { isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetRecentAlerts();
  const { sosActive, dismissSos } = useSos();
  const [alertsOpen, setAlertsOpen] = useState(false);

  const [loc, setLoc] = useState<LocationState>({ city: "", coords: "", loading: true, error: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoc({ city: "Location unavailable", coords: "", loading: false, error: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown city";
            const country = data.address?.country || "";
            setLoc({ city: `${city}, ${country}`, coords, loading: false, error: null });
          })
          .catch(() => {
            setLoc({ city: "Location found", coords, loading: false, error: null });
          });
      },
      () => {
        setLoc({ city: "Sharjah, U.A.E.", coords: "25.3463°N, 55.4209°E", loading: false, error: null });
      },
      { timeout: 5000 }
    );
  }, []);

  const displayedAlerts = alerts ? alerts.slice(0, 3) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ─── SOS MODE ACTIVE BANNER ─── */}
      {sosActive && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-red-500 bg-red-950/60 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent pointer-events-none" />
          <div className="relative p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
              <div className="w-3 h-3 rounded-full bg-red-500 relative" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-base uppercase tracking-wide">SOS Mode Active</p>
              <div className="flex flex-wrap gap-4 mt-0.5 text-xs text-red-300/90">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live location being shared
                </span>
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  Emergency audio recording in progress
                </span>
              </div>
            </div>
            <button
              onClick={dismissSos}
              className="shrink-0 flex items-center gap-1.5 text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <X className="w-3 h-3" /> End SOS
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Personal Safety Dashboard</h1>
        <p className="text-muted-foreground">Your comprehensive safety overview and active alerts.</p>
      </div>

      {/* Current Location Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full shrink-0">
              <MapPin className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Current Location</p>
              {loc.loading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-foreground">{loc.city}</p>
                  {loc.coords && <p className="text-xs text-muted-foreground font-mono">{loc.coords}</p>}
                </div>
              )}
            </div>
            <Badge variant="outline" className="border-green-400 text-green-600 dark:text-green-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse inline-block" />
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access — 4 cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        {isLoadingSummary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACCESS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="h-full cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Alerts + Safety Tips side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Alerts — collapsible accordion */}
        <div className="lg:col-span-2">
          <button
            onClick={() => setAlertsOpen((o) => !o)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h2 className="text-xl font-semibold">Recent Alerts</h2>
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
              {displayedAlerts.length > 0 && (
                <Badge variant="secondary" className="text-xs">{displayedAlerts.length}</Badge>
              )}
              {alertsOpen
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {alertsOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              {isLoadingAlerts ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : displayedAlerts.length > 0 ? (
                <div className="space-y-3">
                  {displayedAlerts.map((alert) => (
                    <Card
                      key={alert.id}
                      className={`border-l-4 ${
                        alert.severity === "critical" ? "border-l-destructive" :
                        alert.severity === "high" ? "border-l-orange-500" :
                        alert.severity === "medium" ? "border-l-yellow-500" : "border-l-primary"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              alert.severity === "critical" ? "text-destructive" :
                              alert.severity === "high" ? "text-orange-500" :
                              alert.severity === "medium" ? "text-yellow-500" : "text-primary"
                            }`} />
                            <span className="font-semibold capitalize text-sm">{alert.type.replace(/_/g, " ")}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-0.5">{alert.message}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {alert.location}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-10 text-center text-muted-foreground">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
                    <p className="font-medium">All clear — no recent alerts</p>
                    <p className="text-sm mt-1">Your safety network is active and monitoring.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!alertsOpen && (
            <p className="text-sm text-muted-foreground">
              {isLoadingAlerts ? "Loading..." : displayedAlerts.length === 0
                ? "No recent alerts — all clear."
                : `${displayedAlerts.length} alert${displayedAlerts.length !== 1 ? "s" : ""} — click to expand.`}
            </p>
          )}
        </div>

        {/* Safety Tips */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Safety Tips</h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              {[
                { icon: Shield, tip: "Share your live route with your Safety Circle before travelling at night." },
                { icon: Archive, tip: "Open Memory Capsule weekly — the AI gets smarter with more incidents logged." },
                { icon: PhoneIncoming, tip: "Set up Fake Call presets so you can escape instantly without looking at the app." },
              ].map(({ icon: Icon, tip }, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
