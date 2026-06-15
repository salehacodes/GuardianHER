import { useState } from "react";
import { useAnalyzeDeepfake } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanFace, AlertTriangle, CheckCircle, Upload, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Deepfake() {
  const [url, setUrl] = useState("");
  const analyze = useAnalyzeDeepfake();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    analyze.mutate({
      data: {
        mediaUrl: url,
        mediaType: "image", // Defaulting for UI simplicity
        description: "User submitted media for analysis"
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Deepfake Detection Hub</h1>
        <p className="text-muted-foreground">Advanced forensic analysis to identify manipulated media and synthetic content.</p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Submit Media for Analysis</CardTitle>
          <CardDescription>Enter a URL to an image or video to run it through our detection engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-3">
            <div className="relative flex-1">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="https://example.com/media.mp4" 
                className="pl-10 h-12"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 w-32" disabled={analyze.isPending}>
              {analyze.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analyze.isPending && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <ScanFace className="w-12 h-12 text-primary animate-pulse" />
            <div className="space-y-2 max-w-sm w-full">
              <p className="font-medium">Running Forensic Analysis...</p>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-muted-foreground">Scanning for temporal inconsistencies and structural artifacts</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analyze.data && !analyze.isPending && (
        <Card className={`border-2 overflow-hidden ${analyze.data.isDeepfake ? 'border-destructive' : 'border-green-500'}`}>
          <div className={`p-4 text-center font-bold text-lg text-white ${analyze.data.isDeepfake ? 'bg-destructive' : 'bg-green-500'}`}>
            {analyze.data.isDeepfake ? 'High Probability of Manipulation Detected' : 'Media Appears Authentic'}
          </div>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">AI Confidence Score</span>
                    <span className="font-bold text-2xl">{analyze.data.confidence}%</span>
                  </div>
                  <Progress value={analyze.data.confidence} className={`h-3 ${analyze.data.isDeepfake ? 'bg-destructive/20 [&>div]:bg-destructive' : 'bg-green-500/20 [&>div]:bg-green-500'}`} />
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Manipulation Score</span>
                    <span className="font-bold text-2xl">{analyze.data.manipulationScore}%</span>
                  </div>
                  <Progress value={analyze.data.manipulationScore} className="h-3" />
                </div>
              </div>

              <div className="bg-muted/50 p-6 rounded-xl space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Forensic Indicators
                </h3>
                <ul className="space-y-3">
                  {analyze.data.indicators.map((indicator, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {analyze.data.isDeepfake ? (
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      )}
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`p-4 rounded-lg border flex gap-3 ${analyze.data.isDeepfake ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-green-500/5 border-green-500/20 text-green-700'}`}>
              <Shield className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Recommendation</h4>
                <p className="text-sm leading-relaxed text-foreground/90">{analyze.data.recommendation}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline">Generate PDF Report</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
