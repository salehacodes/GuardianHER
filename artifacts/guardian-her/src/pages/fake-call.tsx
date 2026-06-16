import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, PhoneIncoming, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRESET_CALLERS = [
  { label: "Mom", name: "Mom", avatar: "👩", number: "+1 (555) 000-0001" },
  { label: "Dad", name: "Dad", avatar: "👨", number: "+1 (555) 000-0002" },
  { label: "Best Friend", name: "Sara", avatar: "👩‍🦱", number: "+1 (555) 000-0003" },
  { label: "Sister", name: "Sister", avatar: "👧", number: "+1 (555) 000-0004" },
];

type CallState = "idle" | "ringing" | "active" | "ended";

export function FakeCall() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [selectedCaller, setSelectedCaller] = useState(PRESET_CALLERS[0]);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [delay, setDelay] = useState(3);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [ringCount, setRingCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  const caller = useCustom
    ? { name: customName || "Unknown", avatar: "📞", number: customNumber || "+1 (555) 000-0000" }
    : selectedCaller;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startFakeCall = () => {
    setCallState("ringing");
    setRingCount(0);
    timerRef.current = setTimeout(() => {
      setCallState("ringing");
    }, delay * 1000);
  };

  useEffect(() => {
    if (callState === "ringing") {
      const interval = setInterval(() => setRingCount((n) => n + 1), 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [callState]);

  const acceptCall = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCallState("active");
    setCallDuration(0);
    durationRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };

  const endCall = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (durationRef.current) clearInterval(durationRef.current);
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fake Call Escape</h1>
        <p className="text-muted-foreground mt-1">
          Trigger a realistic incoming call to escape uncomfortable situations discreetly.
        </p>
      </div>

      {callState !== "idle" && callState !== "ended" ? (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between py-20 px-8">
          <div className="text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              {callState === "ringing" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-white/10 animate-ping scale-150" />
                  <div className="absolute inset-0 rounded-full bg-white/5 animate-ping scale-125 [animation-delay:0.3s]" />
                </>
              )}
              <div className="relative w-28 h-28 rounded-full bg-white/10 flex items-center justify-center text-6xl border-2 border-white/20">
                {caller.avatar}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-4xl font-bold">{caller.name}</h2>
              <p className="text-white/60 text-lg">{caller.number}</p>
              {callState === "ringing" ? (
                <div className="flex items-center gap-2 justify-center">
                  <PhoneIncoming className="w-4 h-4 text-green-400 animate-bounce" />
                  <p className="text-white/80 font-medium">Incoming call...</p>
                </div>
              ) : (
                <p className="text-white/80 font-mono text-xl">{formatDuration(callDuration)}</p>
              )}
            </div>
          </div>

          {callState === "ringing" ? (
            <div className="flex gap-16 items-center w-full justify-center">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-white/60 text-sm">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={acceptCall}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform animate-bounce"
                >
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <span className="text-white/60 text-sm">Accept</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-3 gap-4 text-center text-white/60 text-sm max-w-xs mx-auto">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 active:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span>{isMuted ? "Unmute" : "Mute"}</span>
                </button>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10">
                  <span className="text-2xl">🔊</span>
                  <span>Speaker</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10">
                  <span className="text-2xl">⌨️</span>
                  <span>Keypad</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-white/60 text-sm">End Call</span>
              </div>
            </div>
          )}
        </div>
      ) : callState === "ended" ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <PhoneOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">Call ended</p>
          <p className="text-muted-foreground text-sm">Stay safe.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold mb-3">Who's calling?</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_CALLERS.map((c) => (
                    <button
                      key={c.label}
                      onClick={() => { setSelectedCaller(c); setUseCustom(false); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        !useCustom && selectedCaller.label === c.label
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="text-3xl">{c.avatar}</span>
                      <span className="text-sm font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => setUseCustom(!useCustom)}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {useCustom ? "← Use preset caller" : "+ Custom caller name"}
                </button>
                {useCustom && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <Input
                      placeholder="Caller name (e.g. Dr. Priya)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                    <Input
                      placeholder="Phone number"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-sm font-semibold">Ring delay</p>
                <div className="flex gap-2">
                  {[0, 3, 5, 10].map((s) => (
                    <Badge
                      key={s}
                      variant={delay === s ? "default" : "outline"}
                      className="cursor-pointer px-4 py-1.5 text-sm"
                      onClick={() => setDelay(s)}
                    >
                      {s === 0 ? "Instant" : `${s}s`}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Phone will ring after {delay === 0 ? "no" : `${delay} second`} delay — good for casually pulling it out.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Tip:</strong> Put your phone back in your pocket after tapping the button — it'll ring after the delay so it looks completely natural.
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold gap-3"
            onClick={startFakeCall}
          >
            <PhoneIncoming className="w-6 h-6" />
            Trigger Fake Call from {caller.name}
          </Button>
        </div>
      )}
    </div>
  );
}
