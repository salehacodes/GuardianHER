import { ShieldAlert, MapPin, Navigation, Bot, Activity, AlertTriangle, Phone, Radio, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGetSafetyScore } from "@workspace/api-client-react";
import { useSos } from "@/context/sos-context";

export function Home() {
  const [location, setLocation] = useState("");
  const safetyScore = useGetSafetyScore();
  const { sosActive, dismissSos } = useSos();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    safetyScore.mutate({ data: { location } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ─── EMERGENCY ACTIVE BANNER ─── */}
      {sosActive && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-red-500 bg-red-950/60 animate-in fade-in duration-300">
          {/* animated scan line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-[shimmer_2s_infinite]" />
          <div className="relative p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Pulsing icon */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <div className="relative w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-400 font-black uppercase tracking-widest text-xs">🚨 Emergency Mode</span>
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                  ACTIVATED
                </span>
              </div>
              <p className="text-white font-semibold text-sm">Your emergency contacts have been notified and location is being shared.</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-red-300/80">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Location sharing live</span>
                <span className="flex items-center gap-1"><Radio className="w-3 h-3" /> Audio recording active</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Contacts notified</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <a
                href="tel:999"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" /> Call 999
              </a>
              <button
                onClick={dismissSos}
                className="flex items-center gap-2 text-white/50 hover:text-white/80 border border-white/20 hover:border-white/40 px-4 py-1.5 rounded-xl text-xs transition-colors"
              >
                <X className="w-3 h-3" /> I'm safe
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
          <ShieldAlert className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Your Personal Guardian
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Intelligent, proactive safety monitoring powered by community reports and real-time data.
        </p>
      </div>

      <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            Check Area Safety
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter a location, neighborhood, or address..."
              className="bg-background h-12 text-lg"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button size="lg" className="h-12 px-8" disabled={safetyScore.isPending}>
              {safetyScore.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
        </div>

        {safetyScore.data && (
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={safetyScore.data.score > 80 ? "#22c55e" : safetyScore.data.score > 50 ? "#eab308" : "#ef4444"}
                  strokeWidth="8"
                  strokeDasharray={`${safetyScore.data.score * 2.827} 282.7`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{safetyScore.data.score}</span>
                <span className="text-xs uppercase font-semibold text-muted-foreground">Score</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{safetyScore.data.location}</h3>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-primary/10 text-primary">
                  Risk Level: {safetyScore.data.riskLevel}
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <p className="font-medium text-sm text-muted-foreground mb-1">AI Predictive Alert</p>
                <p className="text-foreground">{safetyScore.data.predictiveAlert}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/routes" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-accent/10 text-accent rounded-full group-hover:scale-110 transition-transform">
                <Navigation className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg">Safe Routes</h3>
              <p className="text-sm text-muted-foreground">Find the safest path to your destination with real-time risk assessment.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/guardian" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg">Guardian Mode</h3>
              <p className="text-sm text-muted-foreground">Share your journey live with trusted contacts and schedule check-ins.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assistant" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-secondary/20 text-secondary-foreground rounded-full group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Get immediate advice, resources, and guidance for any safety concern.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
