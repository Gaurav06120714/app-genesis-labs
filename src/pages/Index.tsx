import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, QrCode, Smartphone, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">ATTENDO</h1>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-foreground">
            Secure Attendance Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Revolutionary attendance tracking with QR codes, facial recognition, and multi-layer verification
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
            Start Tracking Attendance
          </Button>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <QrCode className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Dynamic QR Codes</CardTitle>
              <CardDescription>
                Time-limited QR codes with 5-10 second validity for maximum security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Multi-Layer Verification</CardTitle>
              <CardDescription>
                Facial recognition, Wi-Fi validation, and device authentication
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Real-Time Updates</CardTitle>
              <CardDescription>
                Instant attendance marking with live dashboards for all stakeholders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Parent Notifications</CardTitle>
              <CardDescription>
                Automated daily updates and alerts for attendance below 65%
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription>
                Join hundreds of institutions using ATTENDO for secure attendance management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => navigate("/auth")} className="w-full">
                Create Your Account
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
