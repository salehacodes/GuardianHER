import { useState } from "react";
import { Shield, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo + brand */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/30 mx-auto">
            <Shield className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">GuardianHER</h1>
          <p className="text-muted-foreground text-sm">Your intelligent safety companion</p>
        </div>

        <Card className="border border-border/60 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            {/* Tab toggle */}
            <div className="flex rounded-xl bg-muted/60 p-1 gap-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Full name"
                    className="pl-10 h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "signup"}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pl-10 pr-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" size="lg" className="w-full h-11 font-bold text-base mt-2">
                {mode === "login" ? "Log In" : "Create Account"}
              </Button>
            </form>

            {mode === "login" && (
              <p className="text-center text-xs text-muted-foreground">
                <span
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => setMode("signup")}
                >
                  Don't have an account? Sign up
                </span>
              </p>
            )}
            {mode === "signup" && (
              <p className="text-center text-xs text-muted-foreground">
                <span
                  className="text-primary hover:underline cursor-pointer"
                  onClick={() => setMode("login")}
                >
                  Already have an account? Log in
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Your safety is our priority. All data is encrypted.
        </p>
      </div>
    </div>
  );
}
