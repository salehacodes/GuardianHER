import { useGetDashboardSummary, useGetRecentAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Activity, Users, FolderLock, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetRecentAlerts();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Personal Safety Dashboard</h1>
        <p className="text-muted-foreground">Your comprehensive safety overview and active alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingSummary ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : summary && (
          <>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Safety Score</p>
                  <p className="text-3xl font-bold text-primary">{summary.safetyScore}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Sessions</p>
                  <p className="text-3xl font-bold">{summary.activeGuardianSessions}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-full">
                  <Activity className="w-6 h-6 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Safety Circle</p>
                  <p className="text-3xl font-bold">{summary.circleContacts}</p>
                </div>
                <div className="p-3 bg-secondary/20 rounded-full">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Recent Reports</p>
                  <p className="text-3xl font-bold">{summary.recentReports}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Evidence Items</p>
                  <p className="text-3xl font-bold">{summary.evidenceItems}</p>
                </div>
                <div className="p-3 bg-muted rounded-full">
                  <FolderLock className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">SOS Sent</p>
                  <p className="text-3xl font-bold text-destructive">{summary.sosAlertsSent}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Recent Alerts</h2>
          {isLoadingAlerts ? (
            <div className="space-y-4">
               {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map(alert => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.severity === 'critical' ? 'border-l-destructive' : 
                  alert.severity === 'high' ? 'border-l-orange-500' : 
                  alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-primary'
                }`}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-destructive' : 
                          alert.severity === 'high' ? 'text-orange-500' : 
                          alert.severity === 'medium' ? 'text-yellow-500' : 'text-primary'
                        }`} />
                        <span className="font-semibold capitalize text-sm">{alert.type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p>No recent alerts.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
