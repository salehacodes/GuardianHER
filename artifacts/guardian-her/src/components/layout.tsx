          import { Link, useLocation } from "wouter";
          import { Shield, Home, LayoutDashboard, Map, Navigation, FolderLock, ScanFace, Bot, Users, Activity, Bell, Sun, Moon, PhoneIncoming } from "lucide-react";
          import { useSendSosAlert } from "@workspace/api-client-react";
          import { Button } from "@/components/ui/button";
          import { useToast } from "@/hooks/use-toast";

          interface LayoutProps {
            children: React.ReactNode;
            isDark: boolean;
            onToggleTheme: () => void;
          }

          export function Layout({ children, isDark, onToggleTheme }: LayoutProps) {
            const [location] = useLocation();
            const { toast } = useToast();

            const sosAlert = useSendSosAlert();

            const handleSos = () => {
              sosAlert.mutate({
                data: {
                  location: "Current Location",
                  message: "Emergency! I need help.",
                }
              }, {
                onSuccess: () => {
                  toast({
                    title: "SOS Alert Sent",
                    description: "Your emergency contacts have been notified.",
                    variant: "destructive"
                  });
                }
              });
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
            ];

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

                  <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link 
                          key={item.href} 
                          href={item.href} 
                          className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
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
                    {/* New Inverted Theme Controller Switch Button */}
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

                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </header>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                  </div>
                </main>
              </div>
            );
          }