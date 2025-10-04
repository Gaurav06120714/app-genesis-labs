import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { QrCode, LogOut, User } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchAttendanceStats();
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

  const fetchAttendanceStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!student) return;

    const { data: records, count: totalRecords } = await supabase
      .from("attendance_records")
      .select("*", { count: "exact" })
      .eq("student_id", student.id);

    const presentCount = records?.filter(r => r.status === "present").length || 0;
    const percentage = totalRecords ? Math.round((presentCount / totalRecords) * 100) : 0;
    setAttendancePercentage(percentage);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getAttendanceColor = () => {
    if (attendancePercentage >= 75) return "bg-green-500";
    if (attendancePercentage >= 65) return "bg-yellow-500";
    return "bg-red-500";
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
              <CardTitle>Welcome back, {profile?.full_name?.split(" ")[0]}!</CardTitle>
              <CardDescription>Track your attendance and stay on top of your classes</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Your current attendance percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{attendancePercentage}%</span>
                  {attendancePercentage < 65 && (
                    <span className="text-sm text-destructive font-medium">⚠️ Below Required</span>
                  )}
                </div>
                <Progress value={attendancePercentage} className={getAttendanceColor()} />
                <p className="text-sm text-muted-foreground">
                  Minimum required: 65%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Mark your attendance for today's classes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/scan")}
              >
                <QrCode className="mr-2 h-5 w-5" />
                Scan QR Code
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Classes Today</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Attended</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;