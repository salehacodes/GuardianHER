import { useState } from "react";
import { useGetEvidenceItems, useAddEvidenceItem, useDeleteEvidenceItem, getGetEvidenceItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderLock, Image as ImageIcon, Mic, FileText, Smartphone, Plus, Trash2, Calendar } from "lucide-react";
import { EvidenceInputType } from "@workspace/api-zod";

export function Evidence() {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useGetEvidenceItems();
  const addItem = useAddEvidenceItem();
  const deleteItem = useDeleteEvidenceItem();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: "document" as EvidenceInputType,
    description: "",
    category: "",
    incidentDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem.mutate({ data: formData }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetEvidenceItemsQueryKey() });
        setFormData({ type: "document", description: "", category: "", incidentDate: "" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEvidenceItemsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'voice': return <Mic className="w-5 h-5" />;
      case 'screenshot': return <Smartphone className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evidence Vault</h1>
          <p className="text-muted-foreground">Secure, encrypted storage for important documentation.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Evidence
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                    <SelectItem value="voice">Voice Recording</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input 
                  placeholder="e.g. Harassment, Cyberstalking, Suspicious Activity" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Incident Date</label>
                <Input 
                  type="date"
                  value={formData.incidentDate}
                  onChange={e => setFormData({...formData, incidentDate: e.target.value})}
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

              <Button type="submit" className="w-full" disabled={addItem.isPending}>
                {addItem.isPending ? "Encrypting & Saving..." : "Secure in Vault"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          items?.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 bg-muted/40 border-b flex justify-between items-start">
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
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-4 line-clamp-3">{item.description}</p>
                  
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
