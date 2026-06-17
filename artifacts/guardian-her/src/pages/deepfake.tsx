import { useState, useEffect, useRef } from "react";
import { useAnalyzeDeepfake, useAddEvidenceItem, getGetEvidenceItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScanFace, AlertTriangle, CheckCircle, Upload, Shield, Clipboard, Download, FolderLock, FileImage, Video, Mic, File, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const ANALYSIS_STEPS = [
  "Scanning pixels...",
  "Checking facial boundaries...",
  "Analyzing metadata...",
  "Generating report..."
];

export function Deepfake() {
  const [url, setUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");
  const [stepIndex, setStepIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyze = useAnalyzeDeepfake();
  const addItem = useAddEvidenceItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    let interval: any;
    if (analyze.isPending) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex(prev => (prev + 1) % ANALYSIS_STEPS.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [analyze.isPending]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !uploadedFile) return;
    const mediaUrl = uploadedFile ? `file://${uploadedFile.name}` : url;
    analyze.mutate({
      data: {
        mediaUrl,
        mediaType: mediaType === "audio" ? "image" : mediaType,
        description: "User submitted media for analysis"
      }
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setUploadedFile(null);
    } catch (err) {
      toast({ title: "Failed to read clipboard", variant: "destructive" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUrl("");
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendToVault = () => {
    if (!analyze.data) return;
    const mediaUrl = uploadedFile ? `file://${uploadedFile.name}` : url;
    addItem.mutate({
      data: {
        type: "image" as const,
        description: `Deepfake analysis: ${mediaUrl} | ${analyze.data.recommendation}`,
        category: analyze.data.isDeepfake ? "Deepfake/Image Abuse" : "Media Verification",
        incidentDate: new Date().toISOString().split("T")[0],
        fileUrl: mediaUrl
      }
    }, {
      onSuccess: () => {
        toast({ title: "Saved to Evidence Vault" });
        queryClient.invalidateQueries({ queryKey: getGetEvidenceItemsQueryKey() });
      }
    });
  };

  const downloadPdf = () => {
    if (!analyze.data) return;
    const mediaUrl = uploadedFile ? uploadedFile.name : url;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Forensic Media Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Report ID: ${analyze.data.reportId}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 40);
    doc.text(`Media: ${mediaUrl}`, 20, 50);

    doc.setFontSize(16);
    doc.setTextColor(analyze.data.isDeepfake ? 220 : 34, analyze.data.isDeepfake ? 38 : 197, analyze.data.isDeepfake ? 38 : 94);
    doc.text(analyze.data.isDeepfake ? "MANIPULATED DETECTED" : "AUTHENTIC", 20, 70);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Confidence Score: ${analyze.data.confidence}%`, 20, 80);
    doc.text(`Manipulation Score: ${analyze.data.manipulationScore}%`, 20, 90);

    doc.setFontSize(16);
    doc.text("Forensic Indicators", 20, 110);
    doc.setFontSize(12);
    let y = 120;
    analyze.data.indicators.forEach((ind: string) => {
      doc.text(`• ${ind}`, 20, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(16);
    doc.text("Recommendation", 20, y);
    doc.setFontSize(12);
    y += 10;
    const recLines = doc.splitTextToSize(analyze.data.recommendation, 170);
    doc.text(recLines, 20, y);

    doc.save(`Forensic_Report_${analyze.data.reportId}.pdf`);
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
          <CardDescription>Paste a URL or upload a file to run it through our detection engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Media type toggles */}
            <RadioGroup
              value={mediaType}
              onValueChange={(v: any) => setMediaType(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="r1" />
                <Label htmlFor="r1" className="flex items-center gap-1 cursor-pointer">
                  <FileImage className="w-4 h-4" /> Image
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="r2" />
                <Label htmlFor="r2" className="flex items-center gap-1 cursor-pointer">
                  <Video className="w-4 h-4" /> Video
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="r3" />
                <Label htmlFor="r3" className="flex items-center gap-1 cursor-pointer">
                  <Mic className="w-4 h-4" /> Audio
                </Label>
              </div>
            </RadioGroup>

            {/* URL input */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Option 1 — Paste a URL</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/media.mp4"
                    className="pl-10 pr-12 h-12"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUploadedFile(null); }}
                    disabled={!!uploadedFile}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
                    onClick={handlePaste}
                    disabled={!!uploadedFile}
                  >
                    <Clipboard className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* File upload */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Option 2 — Upload a file</p>
              {uploadedFile ? (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <File className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{uploadedFile.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(uploadedFile.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center gap-2 transition-colors group"
                >
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to upload a file
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {mediaType === "image" ? "JPG, PNG, WEBP" : mediaType === "video" ? "MP4, MOV, AVI" : "MP3, WAV, OGG"} supported
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={
                  mediaType === "image" ? "image/*" :
                  mediaType === "video" ? "video/*" : "audio/*"
                }
                onChange={handleFileChange}
              />
            </div>

            <Button
              size="lg"
              className="w-full h-12"
              disabled={analyze.isPending || (!url && !uploadedFile)}
            >
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
              <p className="font-medium">{ANALYSIS_STEPS[stepIndex]}</p>
              <Progress value={((stepIndex + 1) / ANALYSIS_STEPS.length) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {analyze.data && !analyze.isPending && (
        <div className="space-y-6">
          <Card className={`border-2 overflow-hidden ${analyze.data.isDeepfake ? 'border-destructive ring-4 ring-destructive/20' : 'border-green-500 ring-4 ring-green-500/20'}`}>
            <div className={`p-4 text-center font-bold text-lg text-white tracking-widest ${analyze.data.isDeepfake ? 'bg-destructive' : 'bg-green-500'}`}>
              {analyze.data.isDeepfake ? 'MANIPULATED DETECTED' : 'AUTHENTIC'}
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="flex justify-between items-center text-sm font-mono text-muted-foreground border-b pb-4">
                <span>REPORT ID: {analyze.data.reportId}</span>
                <span>{new Date().toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Confidence Score</span>
                      <span className="font-bold text-3xl">{analyze.data.confidence}%</span>
                    </div>
                    <Progress value={analyze.data.confidence} className={`h-4 ${analyze.data.isDeepfake ? 'bg-destructive/20 [&>div]:bg-destructive' : 'bg-green-500/20 [&>div]:bg-green-500'}`} />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Manipulation Index</span>
                      <span className="font-bold text-2xl">{analyze.data.manipulationScore}%</span>
                    </div>
                    <Progress value={analyze.data.manipulationScore} className="h-2" />
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-xl space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Forensic Indicators
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analyze.data.indicators.map((indicator, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${analyze.data.isDeepfake ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-700'}`}>
                        {analyze.data.isDeepfake ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-lg border flex gap-4 ${analyze.data.isDeepfake ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-green-500/5 border-green-500/20 text-green-700'}`}>
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Recommendation</h4>
                  <p className="text-sm leading-relaxed opacity-90">{analyze.data.recommendation}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end pt-4">
                <Button variant="outline" className="gap-2" onClick={downloadPdf}>
                  <Download className="w-4 h-4" /> Download PDF Report
                </Button>
                <Button className="gap-2" onClick={handleSendToVault} disabled={addItem.isPending}>
                  <FolderLock className="w-4 h-4" />
                  {addItem.isPending ? "Saving..." : "Send to Evidence Vault"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analyze.data.isDeepfake && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-semibold flex items-center gap-2 text-primary mb-4">
                  <Shield className="w-5 h-5" />
                  AI Safety Guidance
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-foreground/90 font-medium">
                  <li>Preserve the original file and do not alter it.</li>
                  <li>Screenshot where it was posted, including URLs and usernames.</li>
                  <li>Do not share the manipulated media further.</li>
                  <li>Report the content on the platform where you found it.</li>
                  <li>File a cybercrime complaint at <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-primary underline">cybercrime.gov.in</a> (or local equivalent).</li>
                  <li>Use the report saved in your Evidence Vault to support your case.</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
