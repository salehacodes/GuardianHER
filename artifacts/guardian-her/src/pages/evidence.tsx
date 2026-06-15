import { useState } from "react";
import { 
  useGetEvidenceItems, 
  useAddEvidenceItem, 
  useDeleteEvidenceItem, 
  getGetEvidenceItemsQueryKey,
  useCategorizeEvidence,
  useGenerateIncidentReport
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderLock, Image as ImageIcon, Mic, FileText, Smartphone, 
  Plus, Trash2, Calendar, Brain, Download, Share2, Copy, FileIcon,
  AlertTriangle
} from "lucide-react";
import jsPDF from "jspdf";
type EvidenceInputType = "screenshot" | "voice" | "image" | "document";

export function Evidence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useGetEvidenceItems();
  const addItem = useAddEvidenceItem();
  const deleteItem = useDeleteEvidenceItem();
  const categorize = useCategorizeEvidence();
  const generateReport = useGenerateIncidentReport();
  
  const [isOpen, setIsOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const [reportTitle, setReportTitle] = useState("");
  const [reportContext, setReportContext] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: "document" as EvidenceInputType | "video",
    description: "",
    category: "",
    incidentDate: ""
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleAIAnalyze = async () => {
    if (!formData.description || !formData.incidentDate) {
      toast({ title: "Missing details", description: "Please enter a description and date first.", variant: "destructive" });
      return;
    }
    categorize.mutate(
      { data: { description: formData.description, type: formData.type === "video" ? "document" : formData.type, incidentDate: formData.incidentDate } },
      {
        onSuccess: (data) => {
          setAiAnalysis(data);
          setFormData(prev => ({ ...prev, category: data.category }));
          toast({ title: "Analysis complete", description: "Category auto-filled based on AI analysis." });
        }
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitType = formData.type === "video" ? "document" : formData.type;
    addItem.mutate({ 
      data: { 
        type: submitType, 
        description: formData.description, 
        category: formData.category, 
        incidentDate: formData.incidentDate,
        fileUrl: "" // omitted for mockup
      } 
    }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetEvidenceItemsQueryKey() });
        setFormData({ type: "document", description: "", category: "", incidentDate: "" });
        setAiAnalysis(null);
        toast({ title: "Evidence secured", description: "Added to your encrypted vault." });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEvidenceItemsQueryKey() });
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      }
    });
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || selectedItems.length === 0) return;
    generateReport.mutate(
      { data: { evidenceIds: selectedItems, title: reportTitle, additionalContext: reportContext } },
      {
        onSuccess: (data) => {
          setGeneratedReport(data);
          setReportDialogOpen(false);
          toast({ title: "Report generated", description: "Incident report is ready." });
        }
      }
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return "bg-red-500 hover:bg-red-600";
      case 'high': return "bg-orange-500 hover:bg-orange-600";
      case 'medium': return "bg-yellow-500 hover:bg-yellow-600 text-yellow-950";
      case 'low': return "bg-green-500 hover:bg-green-600";
      default: return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'voice': return <Mic className="w-5 h-5" />;
      case 'screenshot': return <Smartphone className="w-5 h-5" />;
      case 'video': return <FileIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const downloadPdf = () => {
    if (!generatedReport) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Incident Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Report ID: ${generatedReport.reportId}`, 20, 30);
    doc.text(`Title: ${generatedReport.title}`, 20, 40);
    doc.text(`Date: ${new Date(generatedReport.generatedAt).toLocaleDateString()}`, 20, 50);
    
    doc.setFontSize(16);
    doc.text("Executive Summary", 20, 70);
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(generatedReport.summary, 170);
    doc.text(summaryLines, 20, 80);
    
    let y = 80 + (summaryLines.length * 7) + 10;
    
    doc.setFontSize(16);
    doc.text("Timeline", 20, y);
    doc.setFontSize(12);
    y += 10;
    const timelineLines = doc.splitTextToSize(generatedReport.timeline, 170);
    doc.text(timelineLines, 20, y);
    
    y += (timelineLines.length * 7) + 10;
    
    doc.addPage();
    y = 20;
    
    doc.setFontSize(16);
    doc.text("Recommendations", 20, y);
    y += 10;
    doc.setFontSize(12);
    generatedReport.recommendations.forEach((rec: string) => {
      const lines = doc.splitTextToSize(`• ${rec}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7 + 2;
    });
    
    y += 10;
    doc.setFontSize(16);
    doc.text("Legal Steps", 20, y);
    y += 10;
    doc.setFontSize(12);
    generatedReport.legalSteps.forEach((step: string, i: number) => {
      const lines = doc.splitTextToSize(`${i+1}. ${step}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7 + 2;
    });

    doc.save(`Report_${generatedReport.reportId}.pdf`);
  };

  const copyToClipboard = () => {
    if (!generatedReport) return;
    const text = `INCIDENT REPORT: ${generatedReport.reportId}\nTitle: ${generatedReport.title}\n\nSUMMARY:\n${generatedReport.summary}\n\nTIMELINE:\n${generatedReport.timeline}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Report text copied to clipboard." });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Safety Center</h1>
          <p className="text-muted-foreground">Secure your evidence, run AI analysis, and generate official reports.</p>
        </div>
        
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <FileText className="w-4 h-4" />
                  Generate Report ({selectedItems.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Incident Report</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerateReport} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Title</label>
                    <Input 
                      placeholder="e.g., Harassment incident 2024" 
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Context (Optional)</label>
                    <Textarea 
                      placeholder="Any additional details to guide the AI..." 
                      value={reportContext}
                      onChange={(e) => setReportContext(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={generateReport.isPending}>
                    {generateReport.isPending ? "Generating..." : "Generate PDF Report"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Evidence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload to Vault</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Evidence Type</label>
                  <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image/Photo</SelectItem>
                      <SelectItem value="screenshot">Screenshot</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="voice">Audio Recording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Date *</label>
                  <Input 
                    type="date"
                    value={formData.incidentDate}
                    onChange={e => setFormData({...formData, incidentDate: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    placeholder="Details about this evidence..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 gap-2" 
                    onClick={handleAIAnalyze}
                    disabled={categorize.isPending}
                  >
                    <Brain className="w-4 h-4" />
                    {categorize.isPending ? "Analyzing..." : "AI Analyze"}
                  </Button>
                </div>

                {aiAnalysis && (
                  <div className="p-3 bg-muted/50 rounded-lg border text-sm space-y-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{aiAnalysis.category}</Badge>
                      <Badge className={getSeverityColor(aiAnalysis.severity)}>{aiAnalysis.severity} Severity</Badge>
                    </div>
                    <p className="text-muted-foreground">{aiAnalysis.summary}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input 
                    placeholder="e.g. Harassment, Cyberstalking..." 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={addItem.isPending}>
                  {addItem.isPending ? "Encrypting & Saving..." : "Secure in Vault"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {generatedReport && (
        <Card className="border-indigo-200 shadow-md">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="secondary" className="mb-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                  {generatedReport.incidentType}
                </Badge>
                <CardTitle className="text-xl flex items-center gap-2">
                  {generatedReport.title}
                </CardTitle>
                <CardDescription className="font-mono text-xs mt-1">
                  ID: {generatedReport.reportId} | {new Date(generatedReport.generatedAt).toLocaleString()}
                </CardDescription>
              </div>
              <Badge className={getSeverityColor(generatedReport.severity)}>
                {generatedReport.severity} Priority
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Executive Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{generatedReport.summary}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Incident Timeline</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedReport.timeline}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {generatedReport.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Legal Steps
                </h4>
                <ol className="list-decimal pl-5 text-sm text-primary/90 space-y-1 font-medium">
                  {generatedReport.legalSteps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button onClick={downloadPdf} variant="default" className="gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" /> Copy
              </Button>
              <Button onClick={() => toast({ title: "Shared", description: "Report shared with Safety Circle." })} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" /> Share with Circle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading vault contents...</p>
        ) : items?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
            <FolderLock className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Your vault is empty</p>
            <p className="text-sm mt-1">Upload screenshots, recordings, or notes to keep them secure.</p>
          </div>
        ) : (
          items?.map((item: any) => (
            <Card key={item.id} className={`overflow-hidden group hover:shadow-md transition-shadow relative ${selectedItems.includes(item.id) ? 'ring-2 ring-primary border-primary' : ''}`}>
              <div className="absolute top-4 left-4 z-10">
                <Checkbox 
                  checked={selectedItems.includes(item.id)} 
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="bg-background"
                />
              </div>
              <CardContent className="p-0">
                <div className="p-4 pl-12 bg-muted/40 border-b flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-md">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm capitalize">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive h-8 w-8 -mt-1 -mr-1"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteItem.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    {item.severity && (
                      <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground mb-3 line-clamp-3">{item.description}</p>
                  
                  {item.summary && (
                    <div className="mb-4 p-2 bg-muted/50 rounded border text-xs text-muted-foreground line-clamp-2">
                      <Brain className="w-3 h-3 inline mr-1" /> {item.summary}
                    </div>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {item.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {item.incidentDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Incident: {new Date(item.incidentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
