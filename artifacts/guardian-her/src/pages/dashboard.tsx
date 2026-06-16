import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetDashboardSummary, useGetRecentAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Activity, Users, FolderLock, AlertTriangle, Clock,
  MapPin, Navigation, ScanFace, Bot, PhoneIncoming, Archive, Map
} from "lucide-react";

type LocationState = { city: string; coords: string; loading: boolean; error: string | null };

const QUICK_LINKS = [
  { href: "/map", label: "Safety Map", icon: Map, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", desc: "View heatmap & safe spaces" },
  { href: "/routes", label: "Safe Routes", icon: Navigation, color: "bg-green-500/10 text-green-600 dark:text-green-400", desc: "Plan your journey" },
  { href: "/circle", label: "Safety Circle", icon: Users, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", desc: "Manage your contacts" },
  { href: "/guardian", label: "Guardian Mode", icon: Activity, color: "bg-primary/10 text-primary", desc: "Start journey tracking" },
  { href: "/evidence", label: "Evidence Vault", icon: FolderLock, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", desc: "Secure your evidence" },
  { href: "/deepfake", label: "Deepfake Hub", icon: ScanFace, color: "bg-red-500/10 text-red-600 dark:text-red-400", desc: "Detect manipulated media" },
  { href: "/assistant", label: "AI Assistant", icon: Bot, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", desc: "Get safety guidance" },
  { href: "/fake-call", label: "Fake Call", icon: PhoneIncoming, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400", desc: "Escape situations" },
  { href: "/memory", label: "Memory Capsule", icon: Archive, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400", desc: "AI pattern analysis" },
];

export function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetRecentAlerts();

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
        // Reverse geocode using a free nominatim API
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

  const scoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-orange-400";
    return "text-red-500";
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
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
                  {loc.coords && (
                    <p className="text-xs text-muted-foreground font-mono">{loc.coords}</p>
                  )}
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

      {/* Safety Score + Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoadingSummary ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : summary && (
          <>
            <Link href="/dashboard">
              <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all col-span-2 md:col-span-1">
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Safety Score</p>
                  <p className={`text-3xl font-bold ${scoreColor(summary.safetyScore)}`}>{summary.safetyScore}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">out of 100</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guardian">
              <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
                <CardContent className="p-4 text-center">
                  <Activity className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Guardian</p>
                  <p className="text-2xl font-bold">{summary.activeGuardianSessions}</p>
                  <p className="text-[10px] text-muted-foreground">active</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/circle">
              <Card className="cursor-pointer hover:border-purple-400/50 hover:shadow-md transition-all">
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Circle</p>
                  <p className="text-2xl font-bold">{summary.circleContacts}</p>
                  <p className="text-[10px] text-muted-foreground">contacts</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/map">
              <Card className="cursor-pointer hover:border-blue-400/50 hover:shadow-md transition-all">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Reports</p>
                  <p className="text-2xl font-bold">{summary.recentReports}</p>
                  <p className="text-[10px] text-muted-foreground">recent</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/evidence">
              <Card className="cursor-pointer hover:border-orange-400/50 hover:shadow-md transition-all">
                <CardContent className="p-4 text-center">
                  <FolderLock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Evidence</p>
                  <p className="text-2xl font-bold">{summary.evidenceItems}</p>
                  <p className="text-[10px] text-muted-foreground">secured</p>
                </CardContent>
              </Card>
            </Link>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4 text-center">
                <Shield className="w-5 h-5 text-destructive mx-auto mb-1" />
                <p className="text-xs font-medium text-destructive">SOS Sent</p>
                <p className="text-2xl font-bold text-destructive">{summary.sosAlertsSent}</p>
                <p className="text-[10px] text-destructive/70">alerts</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group bg-card">
                <div className={`p-2.5 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-center text-muted-foreground leading-tight">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Recent Alerts</h2>
          {isLoadingAlerts ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
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
