import { useState } from "react";
import { useGetCircleContacts, useAddCircleContact, useRemoveCircleContact, getGetCircleContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Phone, UserMinus, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Circle() {
  const queryClient = useQueryClient();
  const { data: contacts, isLoading } = useGetCircleContacts();
  const addContact = useAddCircleContact();
  const removeContact = useRemoveCircleContact();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContact.mutate({ data: formData }, {
      onSuccess: () => {
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetCircleContactsQueryKey() });
        setFormData({ name: "", relationship: "", phone: "" });
      }
    });
  };

  const handleDelete = (id: number) => {
    removeContact.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCircleContactsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safety Circle</h1>
          <p className="text-muted-foreground">Trusted contacts who receive your SOS alerts and guardian check-ins.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Trusted Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  placeholder="Jane Doe" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship</label>
                <Input 
                  placeholder="Sister, Friend, Partner..." 
                  value={formData.relationship}
                  onChange={e => setFormData({...formData, relationship: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input 
                  type="tel"
                  placeholder="+1 (555) 000-0000" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={addContact.isPending}>
                {addContact.isPending ? "Adding..." : "Save Contact"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : contacts?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No contacts in your circle</p>
            <p className="text-sm mt-1">Add trusted friends or family to ensure someone always has your back.</p>
            <Button variant="outline" className="mt-6" onClick={() => setIsOpen(true)}>Add Your First Contact</Button>
          </div>
        ) : (
          contacts?.map((contact) => (
            <Card key={contact.id} className="relative overflow-hidden group border-primary/10">
              <div className="absolute top-0 right-0 p-4">
                {contact.isActive ? (
                  <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Last seen: {contact.lastSeen ? new Date(contact.lastSeen).toLocaleDateString() : 'Unknown'}
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary font-bold text-lg">
                  {contact.name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg mb-1">{contact.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                  <ShieldCheck className="w-4 h-4 text-primary/60" />
                  {contact.relationship}
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm font-medium mb-4">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {contact.phone}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-background h-9">Message</Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 h-9 w-9"
                    onClick={() => handleDelete(contact.id)}
                    disabled={removeContact.isPending}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
