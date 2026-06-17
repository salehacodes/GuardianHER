import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SosProvider } from "@/context/sos-context";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import { Dashboard } from "@/pages/dashboard";
import { MapPage } from "@/pages/map";
import { RoutesPage } from "@/pages/routes";
import { Evidence } from "@/pages/evidence";
import { Deepfake } from "@/pages/deepfake";
import { Assistant } from "@/pages/assistant";
import { Circle } from "@/pages/circle";
import { FakeCall } from "@/pages/fake-call";
import { Memory } from "@/pages/memory";
import { Profile } from "@/pages/profile";
import { LoginPage } from "@/pages/login";

const queryClient = new QueryClient();

function Router() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Layout isDark={isDark} onToggleTheme={() => setIsDark(!isDark)}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/map" component={MapPage} />
        <Route path="/routes" component={RoutesPage} />
        <Route path="/evidence" component={Evidence} />
        <Route path="/deepfake" component={Deepfake} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/circle" component={Circle} />
        <Route path="/fake-call" component={FakeCall} />
        <Route path="/memory" component={Memory} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SosProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </SosProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
