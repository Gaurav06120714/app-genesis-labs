import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, LogOut, User, Users } from "lucide-react";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchClasses();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  const fetchClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", user.id);

    setClasses(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">ATTENDO</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{profile?.full_name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Welcome, {profile?.full_name}!</CardTitle>
              <CardDescription>Manage attendance for your classes</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Classes</span>
                  <span className="font-medium text-lg">{classes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Sessions</span>
                  <span className="font-medium text-lg">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new attendance session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="lg" className="w-full">
                <QrCode className="mr-2 h-5 w-5" />
                Generate QR Code
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate("/classes")}>
                <Users className="mr-2 h-5 w-5" />
                Manage Classes
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Classes</CardTitle>
              <CardDescription>
                {classes.length === 0 ? "No classes yet. Create your first class to get started." : `Managing ${classes.length} class${classes.length !== 1 ? "es" : ""}`}
              </CardDescription>
            </CardHeader>
            {classes.length > 0 && (
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {classes.map((cls) => (
                    <Card key={cls.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <CardDescription>{cls.subject}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;