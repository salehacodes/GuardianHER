import { useState, useRef, useEffect } from "react";
import { 
  useChatWithAssistant, 
  useGetCodeWords, 
  useAddCodeWord, 
  useDeleteCodeWord, 
  useCheckCodeWord,
  getGetCodeWordsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, User, Send, Shield, ExternalLink, KeyRound, ChevronDown, Plus, Trash2, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  category?: string;
  resources?: { title: string; url?: string | null }[];
  isAlert?: boolean;
}

export function Assistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello. I am GuardianHER's safety assistant. I can provide guidance, resources, and tactical advice for safety concerns. How can I help you today?",
    }
  ]);
  
  const [cwPhrase, setCwPhrase] = useState("");
  const [cwAction, setCwAction] = useState<string>("silent_sos");
  const [cwNote, setCwNote] = useState("");
  const [isCwOpen, setIsCwOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useChatWithAssistant();
  const checkCodeWord = useCheckCodeWord();
  const { data: codewords } = useGetCodeWords();
  const addCodeWord = useAddCodeWord();
  const deleteCodeWord = useDeleteCodeWord();

  const prompts = [
    "Is it safe to travel here at 11 PM?",
    "What if someone is following me?",
    "How do I report cyberstalking?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // 1. Check code word first
    checkCodeWord.mutate({ data: { message: text } }, {
      onSuccess: (checkRes) => {
        if (checkRes.triggered) {
          // It's a code word! Show alert and stop here.
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: `SILENT ALERT ACTIVATED — ${checkRes.message}`,
            isAlert: true
          }]);
          return;
        }

        // 2. If not a code word, send to regular chat
        chatMutation.mutate({
          data: { message: text }
        }, {
          onSuccess: (res) => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: "assistant",
              content: res.response,
              category: res.category,
              resources: res.resources
            }]);
          }
        });
      }
    });
  };

  const handleAddCodeWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cwPhrase || !cwAction) return;
    
    addCodeWord.mutate({
      data: { phrase: cwPhrase, action: cwAction as any, note: cwNote || undefined }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCodeWordsQueryKey() });
        setCwPhrase("");
        setCwNote("");
        toast({ title: "Code word added" });
      }
    });
  };

  const handleDeleteCodeWord = (id: number) => {
    deleteCodeWord.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCodeWordsQueryKey() });
      }
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'silent_sos': return <Badge variant="destructive">Silent SOS</Badge>;
      case 'share_location': return <Badge className="bg-blue-500 hover:bg-blue-600">Share Location</Badge>;
      case 'notify_circle': return <Badge className="bg-purple-500 hover:bg-purple-600">Notify Circle</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-2 mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          AI Safety Assistant
        </h1>
        <p className="text-muted-foreground">Expert guidance and resources available 24/7. All conversations are encrypted.</p>
      </div>

      <Collapsible open={isCwOpen} onOpenChange={setIsCwOpen} className="mb-6 flex-shrink-0 bg-muted/30 border rounded-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 font-semibold">
              <KeyRound className="w-5 h-5 text-primary" />
              Code Word Emergency System
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCwOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0 border-t bg-background/50 space-y-4">
          <div className="text-sm text-muted-foreground mb-2 mt-4">
            Register phrases that you can use naturally in chat to secretly trigger emergency actions.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Your Code Words</h4>
              {!codewords || codewords.length === 0 ? (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-lg p-4 text-center">
                  No code words registered. Add a phrase only you would use naturally in conversation.
                </div>
              ) : (
                <div className="space-y-2">
                  {codewords.map(cw => (
                    <div key={cw.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">"{cw.phrase}"</span>
                        <div className="flex gap-2 items-center mt-1">
                          {getActionBadge(cw.action)}
                          {cw.note && <span className="text-xs text-muted-foreground">{cw.note}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8" onClick={() => handleDeleteCodeWord(cw.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <form onSubmit={handleAddCodeWord} className="space-y-3 bg-muted/40 p-3 rounded-xl border">
              <h4 className="text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Code Word</h4>
              <Input 
                placeholder="e.g. Can you order a cheese pizza?" 
                value={cwPhrase}
                onChange={e => setCwPhrase(e.target.value)}
                className="h-9 text-sm bg-background"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={cwAction} onValueChange={setCwAction}>
                  <SelectTrigger className="h-9 text-sm bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silent_sos">Silent SOS</SelectItem>
                    <SelectItem value="share_location">Share Location</SelectItem>
                    <SelectItem value="notify_circle">Notify Circle</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Note (optional)" 
                  value={cwNote}
                  onChange={e => setCwNote(e.target.value)}
                  className="h-9 text-sm bg-background"
                />
              </div>
              <Button type="submit" size="sm" className="w-full" disabled={addCodeWord.isPending}>
                Register Code Word
              </Button>
            </form>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-primary/20">
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef as any}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAlert ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                  {msg.isAlert ? <AlertOctagon className="w-5 h-5 text-destructive" /> : <Bot className="w-5 h-5 text-primary" />}
                </div>
              )}
              
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                {msg.role === 'assistant' && msg.category && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{msg.category}</span>
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 
                  msg.isAlert ? 'bg-destructive/10 border-destructive/30 text-destructive font-semibold border rounded-tl-sm' :
                  'bg-muted/50 rounded-tl-sm border'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.resources && msg.resources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Helpful Resources</p>
                    <div className="flex flex-col gap-2">
                      {msg.resources.map((res, i) => (
                        <a key={i} href={res.url || "#"} className="flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors text-sm font-medium text-primary">
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <span className="truncate">{res.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 order-2">
                  <User className="w-5 h-5 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {(chatMutation.isPending || checkCodeWord.isPending) && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/50 rounded-2xl p-4 rounded-tl-sm border">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-background border-t">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {prompts.map((prompt, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary border-primary/10"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          )}
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-2"
          >
            <Input 
              placeholder="Type your question securely..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-12 bg-muted/30 focus-visible:ring-primary/50"
              disabled={chatMutation.isPending || checkCodeWord.isPending}
            />
            <Button size="icon" className="h-12 w-12 shrink-0 rounded-xl" disabled={!input.trim() || chatMutation.isPending || checkCodeWord.isPending}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
