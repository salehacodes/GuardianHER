import { useState, useRef, useEffect } from "react";
import { useChatWithAssistant } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Shield, ExternalLink } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  category?: string;
  resources?: { title: string; url?: string | null }[];
}

export function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello. I am GuardianHER's safety assistant. I can provide guidance, resources, and tactical advice for safety concerns. How can I help you today?",
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatWithAssistant();

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

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

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
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-2 mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          AI Safety Assistant
        </h1>
        <p className="text-muted-foreground">Expert guidance and resources available 24/7. All conversations are encrypted.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md border-primary/20">
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef as any}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                {msg.role === 'assistant' && msg.category && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{msg.category}</span>
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/50 rounded-tl-sm border'}`}>
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

          {chatMutation.isPending && (
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
              disabled={chatMutation.isPending}
            />
            <Button size="icon" className="h-12 w-12 shrink-0 rounded-xl" disabled={!input.trim() || chatMutation.isPending}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
