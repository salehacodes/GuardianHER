import { useState } from "react";
import { useStartGuardianMode, useGuardianCheckin } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, MapPin, Clock, ShieldCheck, AlertOctagon } from "lucide-react";
import { GuardianSession } from "@workspace/api-zod";

export function Guardian() {
  const [destination, setDestination] = useState("");
  const [eta, setEta] = useState("");
  const [activeSession, setActiveSession] = useState<GuardianSession | null>(null);

  const startMode = useStartGuardianMode();
  const checkIn = useGuardianCheckin();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !eta) return;
    startMode.mutate({
      data: { destination, expectedArrivalTime: eta, currentLocation: "Current Location" }
    }, {
      onSuccess: (data) => {
        setActiveSession(data);
      }
    });
  };

  const handleCheckIn = (status: 'safe' | 'need_help') => {
    if (!activeSession) return;
    checkIn.mutate({
      data: { sessionId: activeSession.sessionId, status, location: "Current Location" }
    }, {
      onSuccess: () => {
        if (status === 'safe') {
          setActiveSession(null);
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Guardian Mode</h1>
        <p className="text-muted-foreground">Share your journey live. We'll check in to ensure you arrive safely.</p>
      </div>

      {!activeSession ? (
        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-primary/5 p-8 border-b border-primary/10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <Activity className="w-16 h-16 text-primary relative z-10" />
            </div>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Where are you going?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Destination address" 
                    className="pl-10 h-12 text-lg"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Expected Arrival Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="time"
                    className="pl-10 h-12 text-lg"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">If you don't check in by this time, your safety circle will be alerted.</p>
              </div>

              <Button size="lg" className="w-full h-14 text-lg font-bold mt-4" disabled={startMode.isPending}>
                {startMode.isPending ? "Activating Guardian..." : "Start Journey"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-primary text-primary-foreground p-8 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                ACTIVE
              </div>
            </div>
            <Activity className="w-16 h-16 mx-auto animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold">Guardian is watching over you</h2>
              <p className="text-primary-foreground/80 mt-1">Your location is being shared with your safety circle.</p>
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
                <Button 
                  size="lg" 
                  className="h-16 text-lg bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={() => handleCheckIn('safe')}
                  disabled={checkIn.isPending}
                >
                  <ShieldCheck className="w-6 h-6" />
                  I'm Safe (End Session)
                </Button>
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="h-16 text-lg gap-2"
                  onClick={() => handleCheckIn('need_help')}
                  disabled={checkIn.isPending}
                >
                  <AlertOctagon className="w-6 h-6" />
                  I Need Help
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
