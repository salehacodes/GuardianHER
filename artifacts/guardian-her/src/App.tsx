import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import { Home } from "@/pages/home";
import { Dashboard } from "@/pages/dashboard";
import { MapPage } from "@/pages/map";
import { RoutesPage } from "@/pages/routes";
import { Evidence } from "@/pages/evidence";
import { Deepfake } from "@/pages/deepfake";
import { Assistant } from "@/pages/assistant";
import { Circle } from "@/pages/circle";
import { Guardian } from "@/pages/guardian";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/map" component={MapPage} />
        <Route path="/routes" component={RoutesPage} />
        <Route path="/evidence" component={Evidence} />
        <Route path="/deepfake" component={Deepfake} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/circle" component={Circle} />
        <Route path="/guardian" component={Guardian} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
