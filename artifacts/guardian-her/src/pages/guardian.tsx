import { useState, useEffect, useRef } from "react";
import { useStartGuardianMode, useGuardianCheckin } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Activity, MapPin, Clock, ShieldCheck, AlertOctagon, AlertTriangle,
  XCircle, Eye, EyeOff, Locate, TriangleAlert
} from "lucide-react";

type GuardianSession = {
  sessionId: string;
  destination: string;
  expectedArrivalTime: string;
  status: "active" | "completed" | "alert";
  startedAt: string;
  message?: string;
};

type ShadowEvent = { time: string; message: string; type: "info" | "warn" | "danger" };

export function Guardian() {
  const queryParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const passedDestination = queryParams.get("destination") || "";

  const [destination, setDestination] = useState("");
  const [eta, setEta] = useState("");
  const [activeSession, setActiveSession] = useState<GuardianSession | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Shadow Mode state
  const [shadowMode, setShadowMode] = useState(false);
  const [shadowEvents, setShadowEvents] = useState<ShadowEvent[]>([]);
  const [shadowAlert, setShadowAlert] = useState<string | null>(null);
  const [shadowAlertCountdown, setShadowAlertCountdown] = useState(30);
  const [shadowAlertActive, setShadowAlertActive] = useState(false);
  const shadowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shadowAlertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startMode = useStartGuardianMode();
  const checkIn = useGuardianCheckin();

  // SOS countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEmergencyActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isEmergencyActive, countdown]);

  // Auto-start from route planner
  useEffect(() => {
    if (passedDestination && !activeSession) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 20);
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const autoEta = `${hours}:${minutes}`;
      setEta(autoEta);
      startMode.mutate(
        { data: { destination: passedDestination, expectedArrivalTime: autoEta, currentLocation: "Current Location" } },
        { onSuccess: (data) => setActiveSession(data) }
      );
    }
  }, [passedDestination]);

  // Shadow Mode simulation engine
  useEffect(() => {
    if (!activeSession || !shadowMode) {
      if (shadowTimerRef.current) clearInterval(shadowTimerRef.current);
      return;
    }

    const events: Array<{ delay: number; message: string; type: ShadowEvent["type"] }> = [
      { delay: 8000, message: "Route deviation detected — you moved off the planned path.", type: "warn" },
      { delay: 18000, message: "Long stop detected (5+ min) in an unfamiliar zone.", type: "warn" },
      { delay: 30000, message: "You have stopped in a high-risk area. Are you safe?", type: "danger" },
      { delay: 45000, message: "Location signal stable — continuing to monitor.", type: "info" },
    ];

    const timeouts: NodeJS.Timeout[] = events.map(({ delay, message, type }) =>
      setTimeout(() => {
        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setShadowEvents((prev) => [{ time: now, message, type }, ...prev]);
        if (type === "danger") {
          setShadowAlert(message);
          setShadowAlertActive(true);
          setShadowAlertCountdown(30);
        }
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [activeSession, shadowMode]);

  // Shadow alert auto-countdown → circle alert
  useEffect(() => {
    if (!shadowAlertActive) return;
    if (shadowAlertCountdown <= 0) {
      setShadowAlertActive(false);
      setShadowAlert(null);
      setShadowEvents((prev) => [
        { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), message: "No response received — Safety Circle has been automatically alerted.", type: "danger" },
        ...prev,
      ]);
      return;
    }
    shadowAlertTimerRef.current = setTimeout(() => setShadowAlertCountdown((c) => c - 1), 1000);
    return () => { if (shadowAlertTimerRef.current) clearTimeout(shadowAlertTimerRef.current); };
  }, [shadowAlertActive, shadowAlertCountdown]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !eta) return;
    startMode.mutate(
      { data: { destination, expectedArrivalTime: eta, currentLocation: "Current Location" } },
      { onSuccess: (data) => setActiveSession(data) }
    );
  };

  const handleCheckIn = (status: "safe" | "need_help") => {
    if (!activeSession) return;
    if (status === "need_help") { setCountdown(5); setIsEmergencyActive(true); }
    checkIn.mutate(
      { data: { sessionId: activeSession.sessionId, status, location: "Current Location" } },
      { onSuccess: () => { if (status === "safe") { setActiveSession(null); setIsEmergencyActive(false); setShadowEvents([]); } } }
    );
  };

  const handleShadowSafe = () => {
    setShadowAlertActive(false);
    setShadowAlert(null);
    if (shadowAlertTimerRef.current) clearTimeout(shadowAlertTimerRef.current);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setShadowEvents((prev) => [{ time: now, message: "Check-in confirmed — all clear.", type: "info" }, ...prev]);
  };

  const getEventColor = (type: ShadowEvent["type"]) => {
    if (type === "danger") return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
    if (type === "warn") return "border-l-orange-400 bg-orange-50 dark:bg-orange-950/20";
    return "border-l-primary bg-primary/5";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Guardian Mode</h1>
        <p className="text-muted-foreground">Share your journey live. We'll check in to ensure you arrive safely.</p>
      </div>

      {/* EMERGENCY OVERLAY */}
      {activeSession && isEmergencyActive ? (
        <Card className="border-red-200 bg-red-50/50 shadow-lg animate-in fade-in zoom-in-95 duration-200 max-w-xl mx-auto">
          <CardContent className="p-8 text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto animate-ping absolute left-1/2 -translate-x-1/2 opacity-25" />
            <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto relative shadow-md">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-red-950">
                {countdown > 0 ? `Sending SOS Alert in ${countdown}s...` : "SOS Emergency Alerts Sent!"}
              </h3>
              <p className="text-sm text-red-900/80 max-w-sm mx-auto">
                {countdown > 0
                  ? "Notifying your emergency contacts with your live location."
                  : "Your safety circle and nearby responders have been alerted."}
              </p>
            </div>
            {countdown > 0 ? (
              <Button variant="outline" size="lg" onClick={() => setIsEmergencyActive(false)}
                className="w-full border-red-300 hover:bg-red-100 text-red-900 font-semibold h-12">
                <XCircle className="w-4 h-4 mr-2" /> False Alarm (Cancel)
              </Button>
            ) : (
              <Button variant="destructive" size="lg" onClick={() => setIsEmergencyActive(false)}
                className="w-full bg-red-700 hover:bg-red-800 font-semibold h-12">
                Resolve / I am Safe Now
              </Button>
            )}
          </CardContent>
        </Card>
      ) : !activeSession ? (
        /* SETUP FORM */
        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-primary/5 p-8 border-b border-primary/10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Activity className="w-16 h-16 text-primary relative z-10" />
            </div>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Where are you going?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Destination address" className="pl-10 h-12 text-lg"
                    value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Expected Arrival Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="time" className="pl-10 h-12 text-lg"
                    value={eta} onChange={(e) => setEta(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">If you don't check in by this time, your safety circle will be alerted.</p>
              </div>

              {/* Shadow Mode toggle on setup */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Shadow Mode</p>
                    <p className="text-xs text-muted-foreground">Silently monitors route deviations, long stops, and dangerous zones.</p>
                  </div>
                </div>
                <Switch checked={shadowMode} onCheckedChange={setShadowMode} />
              </div>
              {shadowMode && (
                <div className="text-xs text-primary/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Locate className="w-3.5 h-3.5 shrink-0" />
                  Shadow Mode will silently alert your circle if unusual behavior is detected and you don't respond in 30 seconds.
                </div>
              )}

              <Button size="lg" className="w-full h-14 text-lg font-bold mt-4" disabled={startMode.isPending}>
                {startMode.isPending ? "Activating Guardian..." : "Start Journey"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* LIVE JOURNEY */
        <div className="space-y-6">
          {/* Shadow alert banner */}
          {shadowAlertActive && shadowAlert && (
            <Card className="border-2 border-red-400 bg-red-50 dark:bg-red-950/30 animate-in slide-in-from-top duration-300">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-red-500 rounded-full shrink-0 animate-pulse">
                    <TriangleAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-900 dark:text-red-200">Shadow Mode Alert</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{shadowAlert}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleShadowSafe} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <ShieldCheck className="w-4 h-4 mr-2" /> I'm Safe
                  </Button>
                  <Button onClick={() => handleCheckIn("need_help")} variant="destructive" className="flex-1">
                    <AlertOctagon className="w-4 h-4 mr-2" /> Send SOS
                  </Button>
                </div>
                <p className="text-xs text-red-500 text-center mt-3 font-medium">
                  Auto-alerting circle in {shadowAlertCountdown}s if no response...
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-primary shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300 max-w-xl mx-auto">
            <div className="bg-primary text-primary-foreground p-8 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ACTIVE
                </div>
              </div>
              {shadowMode && (
                <div className="absolute top-0 left-0 p-4">
                  <Badge className="bg-white/20 text-white border-white/30 gap-1">
                    <EyeOff className="w-3 h-3" /> Shadow
                  </Badge>
                </div>
              )}
              <Activity className="w-16 h-16 mx-auto animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold">Guardian is watching over you</h2>
                <p className="text-primary-foreground/80 mt-1">
                  {shadowMode ? "Shadow Mode active — monitoring route silently." : "Your location is being shared with your safety circle."}
                </p>
              </div>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Destination</p>
                  <p className="font-bold text-lg">{activeSession.destination}</p>
                </div>
                <div className="bg-muted p-4 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">Arrival Time</p>
                  <p className="font-bold text-lg">{activeSession.expectedArrivalTime}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-center text-lg">Did you arrive safely?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button size="lg" className="h-16 text-lg bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm font-semibold"
                    onClick={() => handleCheckIn("safe")}>
                    <ShieldCheck className="w-6 h-6" /> I'm Safe (End Session)
                  </Button>
                  <Button size="lg" variant="destructive" className="h-16 text-lg gap-2 shadow-sm font-semibold bg-red-500 hover:bg-red-600"
                    onClick={() => handleCheckIn("need_help")}>
                    <AlertOctagon className="w-6 h-6" /> I Need Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shadow Mode event log */}
          {shadowMode && shadowEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" /> Shadow Activity Log
              </h3>
              <div className="space-y-2">
                {shadowEvents.map((ev, i) => (
                  <div key={i} className={`border-l-4 pl-3 py-2 rounded-r-lg text-sm ${getEventColor(ev.type)}`}>
                    <span className="text-xs text-muted-foreground font-mono mr-2">{ev.time}</span>
                    <span className={ev.type === "danger" ? "text-red-700 dark:text-red-300 font-medium" : ev.type === "warn" ? "text-orange-700 dark:text-orange-300" : ""}>{ev.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shadowMode && shadowEvents.length === 0 && (
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-dashed text-sm text-muted-foreground">
              <Eye className="w-4 h-4 shrink-0" />
              Shadow Mode is silently monitoring your route. Events will appear here as you travel.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
