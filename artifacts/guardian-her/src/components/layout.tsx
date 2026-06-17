import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Shield, LayoutDashboard, Map, Navigation, FolderLock, ScanFace, Bot, Users,
  Bell, Sun, Moon, PhoneIncoming, Archive, Phone, AlertTriangle, Radio, Video,
  MapPin, X, User, PhoneOff
} from "lucide-react";
import { useSendSosAlert, useGetRecentAlerts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSos } from "@/context/sos-context";

interface LayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Layout({ children, isDark, onToggleTheme }: LayoutProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sosSteps, setSosSteps] = useState<boolean[]>([false, false, false, false]);
  const [fakeCallOpen, setFakeCallOpen] = useState(false);
  const [emergencyCallOpen, setEmergencyCallOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { sosActive, overlayActive, activateSos, dismissSos: ctxDismiss, dismissOverlay } = useSos();

  const sosAlert = useSendSosAlert();
  const { data: alerts } = useGetRecentAlerts();

  const unreadCount = alerts?.length ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSos = () => {
    activateSos();
    setSosSteps([false, false, false, false]);
    sosAlert.mutate({ data: { location: "Current Location", message: "Emergency! I need help." } });
    [0, 1, 2, 3].forEach((i) => {
      setTimeout(() => {
        setSosSteps((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, (i + 1) * 700);
    });
  };

  const dismissSos = () => {
    ctxDismiss();
    toast({ title: "Emergency mode dismissed", variant: "destructive" });
  };

  const goHome = () => {
    dismissOverlay();
    navigate("/");
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Safety Map", icon: Map },
    { href: "/routes", label: "Safe Routes", icon: Navigation },
    { href: "/evidence", label: "Evidence Vault", icon: FolderLock },
    { href: "/deepfake", label: "Deepfake Hub", icon: ScanFace },
    { href: "/assistant", label: "AI Assistant", icon: Bot },
    { href: "/circle", label: "Safety Circle", icon: Users },
    { href: "/fake-call", label: "Fake Call Escape", icon: PhoneIncoming },
    { href: "/memory", label: "Memory Capsule", icon: Archive },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  const severityColor = (s: string) => {
    if (s === "critical" || s === "high") return "text-red-500";
    if (s === "medium") return "text-orange-400";
    return "text-primary";
  };

  const sosCheckList = [
    { label: "Live location shared with Safety Circle", icon: MapPin },
    { label: "Emergency contacts notified", icon: Phone },
    { label: "Guardian Mode activated", icon: Shield },
    { label: "Emergency audio recording started", icon: Radio },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">

      {/* ─── FAKE CALL MODAL ─── */}
      {/* Emergency Services Popup */}
      {emergencyCallOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-80 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-8 pb-2 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-white text-xl font-bold">Emergency Services</h3>
              <p className="text-white/40 text-sm">Tap below to dial directly</p>
            </div>
            <div className="px-6 py-4 space-y-2">
              <a
                href="tel:999"
                className="flex items-center gap-3 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-base transition-colors shadow-lg justify-center"
              >
                <Phone className="w-4 h-4" /> Call 999
              </a>
              <a
                href="tel:911"
                className="flex items-center gap-3 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-base transition-colors border border-white/20 justify-center"
              >
                <Phone className="w-4 h-4" /> Call 911
              </a>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setEmergencyCallOpen(false)}
                className="text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {fakeCallOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-72 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top bar */}
            <div className="px-6 pt-8 pb-4 text-center space-y-2">
              <p className="text-white/50 text-sm font-medium tracking-widest uppercase">Calling</p>
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto text-3xl font-black text-primary">
                EC
              </div>
              <h3 className="text-white text-xl font-bold mt-2">Emergency Contact</h3>
              <p className="text-white/50 text-sm flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Ringing...
              </p>
            </div>
            {/* End Call button */}
            <div className="flex justify-center items-center px-8 py-8 bg-white/5">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setFakeCallOpen(false)}
                  className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors shadow-lg"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                </button>
                <span className="text-white/40 text-xs">End Call</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SOS EMERGENCY OVERLAY ─── */}
      {overlayActive && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 border-4 border-red-600 animate-pulse rounded-none pointer-events-none" />

          {/* Back button */}
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={goHome}
              className="flex items-center gap-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            >
              ← Back to Home
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 py-3 space-y-4 overflow-hidden">
            {/* Icon + title */}
            <div className="text-center space-y-2 shrink-0">
              <div className="relative mx-auto w-14 h-14">
                <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
                <div className="relative w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/50">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-red-400 tracking-tight">🚨 Emergency Mode Activated</h1>
              <p className="text-red-300/80 text-xs">Help is being notified. Stay calm.</p>
            </div>

            {/* Checklist */}
            <div className="w-full max-w-sm space-y-1.5 shrink-0">
              {sosCheckList.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-500 ${
                    sosSteps[i]
                      ? "bg-green-500/10 border-green-500/40 text-green-300"
                      : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${sosSteps[i] ? "bg-green-500" : "bg-white/10"}`}>
                    {sosSteps[i] ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <item.icon className="w-2.5 h-2.5 text-white/40" />
                    )}
                  </div>
                  <span className="font-medium text-xs">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="w-full max-w-sm space-y-2 shrink-0">
              <button
                onClick={() => setEmergencyCallOpen(true)}
                className="flex items-center justify-center gap-3 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-base transition-colors shadow-lg shadow-red-600/30"
              >
                <Phone className="w-4 h-4" /> Call Emergency Services
              </button>
              <button
                onClick={() => setFakeCallOpen(true)}
                className="flex items-center justify-center gap-3 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-base transition-colors border border-white/20"
              >
                <PhoneIncoming className="w-4 h-4" /> Call Emergency Contact
              </button>
            </div>

            {/* Live indicators */}
            <div className="flex gap-4 text-xs text-red-400/80 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Recording audio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>Location sharing live</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video className="w-3 h-3" />
                <span>Evidence captured</span>
              </div>
            </div>
          </div>

          {/* Dismiss */}
          <div className="pb-3 flex justify-center shrink-0">
            <button
              onClick={dismissSos}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              <X className="w-3 h-3" /> I'm safe — dismiss emergency mode
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r flex flex-col">
        <Link href="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-sidebar-foreground">GuardianHER</span>
        </Link>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="destructive"
            size="lg"
            className="w-full font-bold text-lg h-14 uppercase tracking-wider rounded-xl shadow-lg"
            onClick={handleSos}
            disabled={sosAlert.isPending}
          >
            {sosAlert.isPending ? "Sending..." : "SOS Panic"}
          </Button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b flex items-center px-6 justify-end bg-background/80 backdrop-blur-md z-10 gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={onToggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Midnight Purple Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 animate-in fade-in zoom-in-75 duration-200" />
            ) : (
              <Moon className="w-5 h-5 text-primary animate-in fade-in zoom-in-75 duration-200" />
            )}
          </Button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">{unreadCount} alerts</Badge>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alerts && alerts.length > 0 ? (
                    alerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        className="px-4 py-3 hover:bg-muted/50 border-b border-border/50 last:border-0 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            alert.severity === "critical" ? "bg-red-500" :
                            alert.severity === "high" ? "bg-orange-500" :
                            alert.severity === "medium" ? "bg-yellow-500" : "bg-primary"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold capitalize ${severityColor(alert.severity)}`}>
                              {alert.type.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-foreground/90 mt-0.5 line-clamp-2">{alert.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {alert.location} · {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      No notifications right now
                    </div>
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-border bg-muted/30">
                  <Link href="/" onClick={() => setNotifOpen(false)}
                    className="text-xs text-primary hover:underline font-medium">
                    View all alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
