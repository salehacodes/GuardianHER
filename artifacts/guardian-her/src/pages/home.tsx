import { ShieldAlert, MapPin, Navigation, Bot, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGetSafetyScore } from "@workspace/api-client-react";

export function Home() {
  const [location, setLocation] = useState("");
  const safetyScore = useGetSafetyScore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    safetyScore.mutate({
      data: { location }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4 pt-10">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
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
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-muted opacity-20"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
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
