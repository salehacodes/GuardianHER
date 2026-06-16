import { useState } from "react";
import { useGetCommunityReports, useGetSafetyHeatmap, useGetNearbySafeSpaces, useSubmitCommunityReport, getGetCommunityReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Shield, Heart, Pill, Users, Home, Search, Navigation, Phone, Star, Plus, Lock, AlertTriangle, Eye } from "lucide-react";

export function MapPage() {
  const [location, setLocation] = useState("Sharjah, U.A.E.");
  const [searchLocation, setSearchLocation] = useState("");
  const [spacesFilter, setSpacesFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState<{
    type: "harassment" | "suspicious_activity" | "unsafe_area" | "poor_lighting" | "other";
    description: string;
    location: string;
    severity: "low" | "medium" | "high";
  }>({
    type: "harassment",
    description: "",
    location: "",
    severity: "medium",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: reports } = useGetCommunityReports();
  const heatmap = useGetSafetyHeatmap();
  const safeSpaces = useGetNearbySafeSpaces();
  const submitReport = useSubmitCommunityReport();

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport.mutate(
      { data: { type: reportForm.type, description: reportForm.description, location: reportForm.location, severity: reportForm.severity } },
      {
        onSuccess: () => {
          setReportDialogOpen(false);
          setReportForm({ type: "harassment", description: "", location: "", severity: "medium" });
          queryClient.invalidateQueries({ queryKey: getGetCommunityReportsQueryKey() });
          toast({ title: "Report submitted", description: "Thank you — your anonymous report helps keep the community safer." });
        },
        onError: () => toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" }),
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation) return;
    setLocation(searchLocation);
    heatmap.mutate({ data: { location: searchLocation } });
    safeSpaces.mutate({ data: { location: searchLocation } });
  };

  const getSpaceIcon = (type: string) => {
    switch(type) {
      case 'police': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'hospital': return <Heart className="w-5 h-5 text-red-500" />;
      case 'pharmacy': return <Pill className="w-5 h-5 text-green-500" />;
      case 'womens_center': return <Users className="w-5 h-5 text-purple-500" />;
      case 'shelter': return <Home className="w-5 h-5 text-orange-500" />;
      default: return <Shield className="w-5 h-5 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-500 border-red-200';
      case 'medium': return 'bg-orange-500 border-orange-200';
      case 'low': return 'bg-yellow-500 border-yellow-200 text-yellow-950';
      default: return 'bg-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-2 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Safety Map & Spaces</h1>
        <p className="text-muted-foreground">Community-driven safety insights and verified safe locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <Card className="bg-primary/5 border-primary/20 shrink-0">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                  <Input 
                    placeholder="Search neighborhood or city to find safe spaces..." 
                    className="pl-10 h-12 bg-background border-primary/10 shadow-sm"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <Button size="lg" className="h-12 px-8 font-semibold shadow-sm" disabled={heatmap.isPending || safeSpaces.isPending}>
                  Locate
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-muted/30 border rounded-xl overflow-hidden relative flex-1 min-h-[300px]">
            <div className="absolute inset-0 bg-slate-900 overflow-hidden">
              {/* Base map image */}
              <img
                src="https://shop.askexplorer.com/media/catalog/product/cache/3d45c019409e4e20f2cffb6f8fd4d334/t/m/tmp1261_1622720095_5.png"
                alt="City Street Grid Map"
                className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
              />

              {/* ─── SAFETY BUBBLE: Blue moving corridor ─── */}
              <div className="absolute inset-x-0 top-[38%] bottom-[38%] bg-blue-500/10 border-y border-blue-400/30" />
              {/* pulsing user bubble */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-400/40 animate-ping" />
                <div className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 border-2 border-blue-400/60 animate-pulse" />
                <div className="w-4 h-4 -ml-2 -mt-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/80 border-2 border-white" />
              </div>

              {/* ─── DANGEROUS ZONES: Red blurs for unsafe areas ─── */}
              <div className="absolute top-[18%] left-[15%] w-32 h-32 bg-red-600/25 rounded-full filter blur-2xl animate-pulse [animation-duration:3s]" />
              <div className="absolute bottom-[15%] right-[18%] w-40 h-40 bg-red-500/20 rounded-full filter blur-2xl" />
              <div className="absolute top-[55%] left-[70%] w-24 h-24 bg-orange-500/20 rounded-full filter blur-xl" />

              {/* ─── SAFE ZONES: Green soft glows ─── */}
              <div className="absolute top-[40%] right-[10%] w-28 h-28 bg-green-500/15 rounded-full filter blur-xl" />
              <div className="absolute bottom-[30%] left-[10%] w-20 h-20 bg-green-400/15 rounded-full filter blur-lg" />

              {/* ─── DANGER PINS: Dangerous alleys ─── */}
              {/* Alley 1 */}
              <div className="absolute top-[20%] left-[18%] group cursor-pointer z-20">
                <div className="relative">
                  <div className="w-7 h-7 bg-red-600 rounded-full shadow-lg shadow-red-500/60 flex items-center justify-center border-2 border-red-300 hover:scale-110 transition-transform">
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-900 text-red-100 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-md z-30 font-medium">
                    ⚠ Dark Alley — Harassment reported 2x
                  </div>
                </div>
              </div>
              {/* Alley 2 */}
              <div className="absolute bottom-[18%] right-[20%] group cursor-pointer z-20">
                <div className="w-7 h-7 bg-red-500 rounded-full shadow-lg shadow-red-500/60 flex items-center justify-center border-2 border-red-300 hover:scale-110 transition-transform">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-900 text-red-100 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-md z-30 font-medium">
                  ⚠ Industrial Lane — No lighting
                </div>
              </div>
              {/* Alley 3 */}
              <div className="absolute top-[58%] left-[72%] group cursor-pointer z-20">
                <div className="w-7 h-7 bg-orange-500 rounded-full shadow-lg shadow-orange-500/60 flex items-center justify-center border-2 border-orange-300 hover:scale-110 transition-transform">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-orange-200 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-md z-30 font-medium">
                  ⚠ Underpass — Poor lighting after 8PM
                </div>
              </div>

              {/* ─── SAFE PINS: Verified safe havens ─── */}
              {/* Police */}
              <div className="absolute top-[42%] right-[12%] group cursor-pointer z-20">
                <div className="w-8 h-8 bg-green-500 rounded-full shadow-lg shadow-green-500/60 flex items-center justify-center border-2 border-white hover:scale-110 transition-transform animate-bounce [animation-duration:4s]">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-green-900 text-green-100 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-md z-30 font-medium">
                  ✓ Police Station — Open 24/7
                </div>
              </div>
              {/* Women's Center */}
              <div className="absolute bottom-[32%] left-[12%] group cursor-pointer z-20">
                <div className="w-8 h-8 bg-purple-500 rounded-full shadow-lg shadow-purple-500/60 flex items-center justify-center border-2 border-white hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-purple-900 text-purple-100 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-md z-30 font-medium">
                  ✓ Women's Safety Center
                </div>
              </div>

              {/* ─── INFO OVERLAY ─── */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow border border-slate-700 text-xs max-w-[200px] z-20">
                <span className="text-slate-400">Viewing:</span> <span className="font-semibold text-purple-300 capitalize">{location || "All Areas"}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Live safety bubble active</p>
              </div>

              {/* ─── LEGEND ─── */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow border border-slate-700 text-[10px] space-y-1.5 z-20">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> <span className="text-slate-300">Dangerous alley</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" /> <span className="text-slate-300">Unsafe area</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> <span className="text-slate-300">Safe haven</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-2.5 rounded bg-blue-400/40 border border-blue-400/60" /> <span className="text-slate-300">Safety bubble</span></div>
              </div>

              {/* ─── SAFETY BUBBLE LABEL ─── */}
              <div className="absolute top-3 right-3 bg-blue-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-400/40 z-20">
                <p className="text-[10px] text-blue-300 font-semibold flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> AI Safety Bubble Active
                </p>
              </div>
            </div>
          </div>
            </div>

            <div className="flex flex-col min-h-0">
              <Tabs defaultValue="spaces" className="flex-1 flex flex-col h-full">
                <TabsList className="grid grid-cols-3 mb-4 shrink-0">
                  <TabsTrigger value="spaces">Safe Spaces</TabsTrigger>
                  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="spaces" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 mb-2">
                    {['all', 'police', 'hospital', 'pharmacy', 'womens_center', 'shelter'].map(type => (
                      <Badge 
                        key={type}
                        variant={spacesFilter === type ? 'default' : 'outline'}
                        className="cursor-pointer capitalize whitespace-nowrap"
                        onClick={() => setSpacesFilter(type)}
                      >
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>

              {safeSpaces.data ? (
                safeSpaces.data
                  .filter(space => spacesFilter === 'all' || space.type === spacesFilter)
                  .map((space) => (
                  <Card key={space.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                          <div className="p-2 bg-muted rounded-lg shrink-0">
                            {getSpaceIcon(space.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold leading-tight">{space.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold">
                                {space.type.replace('_', ' ')}
                              </Badge>
                              {space.isOpen ? (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">OPEN</span>
                              ) : (
                                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm">CLOSED</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{space.address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            <span className="font-medium text-foreground">{space.distance}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            4.8
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-2">
                          <Navigation className="w-3 h-3" /> Route
                        </Button>
                        <Button size="sm" variant="default" className="flex-1 gap-2 bg-primary/90">
                          <Phone className="w-3 h-3" /> Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                  <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium mb-1">Find Safe Spaces</p>
                  <p className="text-sm">Search your location to see verified safe havens nearby.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="heatmap" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
              {heatmap.data ? (
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        AI Safety Forecast
                      </h4>
                      <p className="text-sm">{heatmap.data.forecast}</p>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Zone Risk Levels</h4>
                    <div className="space-y-3">
                      {heatmap.data.zones.map((zone: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{zone.name}</span>
                            <span className="capitalize">{zone.riskLevel} Risk</span>
                          </div>
                          <div className="h-2 rounded-full w-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${zone.riskLevel === 'high' ? 'bg-red-500' : zone.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                              style={{ width: `${zone.riskLevel === 'high' ? 85 : zone.riskLevel === 'medium' ? 50 : 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Peak Risk Hours</h4>
                    <div className="flex flex-wrap gap-2">
                      {heatmap.data.peakRiskHours.map((hour: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-orange-200 bg-orange-50 text-orange-800">
                          {hour}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Search a location to generate the safety heatmap.</p>
                </div>
              )}
            </TabsContent>

                <TabsContent value="reports" className="flex-1 overflow-y-auto pr-2 space-y-4 m-0">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 mb-2 items-center">
                    {['all', 'high', 'medium', 'low'].map(severity => (
                      <Badge 
                        key={severity}
                        variant={reportFilter === severity ? 'default' : 'outline'}
                        className="cursor-pointer capitalize whitespace-nowrap"
                        onClick={() => setReportFilter(severity)}
                      >
                        {severity}
                      </Badge>
                    ))}
                    <div className="ml-auto shrink-0">
                      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-1.5 h-7 text-xs">
                            <Plus className="w-3.5 h-3.5" /> Report Incident
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-primary" /> Anonymous Incident Report
                            </DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground -mt-1">Your identity is never recorded. Reports help keep the community safe.</p>
                          <form onSubmit={handleSubmitReport} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Incident Type</label>
                              <Select value={reportForm.type} onValueChange={(v: any) => setReportForm({ ...reportForm, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="harassment">Harassment</SelectItem>
                                  <SelectItem value="suspicious_activity">Stalking / Suspicious Activity</SelectItem>
                                  <SelectItem value="unsafe_area">Unsafe Area / Street</SelectItem>
                                  <SelectItem value="poor_lighting">Poor Lighting</SelectItem>
                                  <SelectItem value="other">Other Safety Concern</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Location</label>
                              <Input placeholder="e.g. Near Central Park, Block 3" value={reportForm.location}
                                onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })} required />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Description</label>
                              <Textarea placeholder="What happened? Be as specific as helpful..." value={reportForm.description}
                                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} required />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Severity</label>
                              <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map(s => (
                                  <button key={s} type="button"
                                    onClick={() => setReportForm({ ...reportForm, severity: s })}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${reportForm.severity === s
                                      ? s === 'high' ? 'bg-red-500 text-white border-red-500'
                                        : s === 'medium' ? 'bg-orange-400 text-white border-orange-400'
                                        : 'bg-yellow-400 text-yellow-950 border-yellow-400'
                                      : 'border-border hover:border-primary/50'}`}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={submitReport.isPending}>
                              {submitReport.isPending ? "Submitting..." : "Submit Anonymously"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* FIXED FILTER LOGIC */}
                  {reports?.filter((report) => {
                    // If 'all' is selected, let every report pass through the filter
                    if (reportFilter === 'all') return true;

                    // Otherwise, check if the report's severity matches the selected tab state
                    return report.severity?.toLowerCase() === reportFilter.toLowerCase();
                  }).map((report) => (
                    <Card key={report.id} className="overflow-hidden border-0 shadow-sm ring-1 ring-border">
                      <div className={`h-1.5 w-full ${getSeverityColor(report.severity)}`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="capitalize text-xs font-semibold">
                            {report.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-2 mb-3 font-medium text-foreground/90">{report.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {report.location}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
