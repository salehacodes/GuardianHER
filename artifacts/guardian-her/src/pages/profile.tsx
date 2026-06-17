import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Shield, Calendar, Users, Activity } from "lucide-react";

export function Profile() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Your account details and safety preferences.</p>
      </div>

      {/* Profile card */}
      <Card className="border-primary/20 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10" />
        <CardContent className="px-6 pb-6 -mt-10">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-black text-primary-foreground border-4 border-background shadow-lg mb-4">
            SJ
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Sarah Johnson</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Shield className="w-3 h-3 mr-1" /> GuardianHER Member
              </Badge>
              <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block animate-pulse" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact details */}
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-base">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Email</p>
                <p className="font-medium">sarah.j@guardianher.app</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Phone</p>
                <p className="font-medium">+971 50 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Location</p>
                <p className="font-medium">Sharjah, United Arab Emirates</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Member Since</p>
                <p className="font-medium">January 2025</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety stats */}
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-base">Safety Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "Safety Score", value: "87", color: "text-green-500" },
              { icon: Users, label: "Circle Members", value: "4", color: "text-purple-400" },
              { icon: Activity, label: "Journeys", value: "23", color: "text-primary" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center text-center p-4 bg-muted/40 rounded-xl border border-border/60">
                <Icon className={`w-5 h-5 mb-2 ${color}`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
