import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Home, LayoutDashboard, Map, Navigation, FolderLock, ScanFace, Bot, Users, Activity, Bell, Sun, Moon, PhoneIncoming, Archive } from "lucide-react";
import { useSendSosAlert, useGetRecentAlerts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Layout({ children, isDark, onToggleTheme }: LayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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
    sosAlert.mutate(
      { data: { location: "Current Location", message: "Emergency! I need help." } },
      {
        onSuccess: () => {
          toast({ title: "SOS Alert Sent", description: "Your emergency contacts have been notified.", variant: "destructive" });
        },
      }
    );
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/map", label: "Safety Map", icon: Map },
    { href: "/routes", label: "Safe Routes", icon: Navigation },
    { href: "/evidence", label: "Evidence Vault", icon: FolderLock },
    { href: "/deepfake", label: "Deepfake Hub", icon: ScanFace },
    { href: "/assistant", label: "AI Assistant", icon: Bot },
    { href: "/circle", label: "Safety Circle", icon: Users },
    { href: "/guardian", label: "Guardian Mode", icon: Activity },
    { href: "/fake-call", label: "Fake Call Escape", icon: PhoneIncoming },
    { href: "/memory", label: "Memory Capsule", icon: Archive },
  ];

  const severityColor = (s: string) => {
    if (s === "critical" || s === "high") return "text-red-500";
    if (s === "medium") return "text-orange-400";
    return "text-primary";
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-sidebar-foreground">GuardianHER</span>
        </div>

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

          {/* Notification Bell with Dropdown */}
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
                    alerts.map((alert) => (
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
                  <Link href="/dashboard" onClick={() => setNotifOpen(false)}
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
