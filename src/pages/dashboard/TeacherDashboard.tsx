import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  QrCode, LayoutDashboard, BookOpen, Users, BarChart3,
  User, CheckCircle, Clock, TrendingUp, Plus, Activity
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SkeletonStatCard } from "@/components/common/SkeletonCard";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import DashboardLayout, { NavItem } from "@/components/layout/DashboardLayout";

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/teacher" },
  { icon: BookOpen, label: "Classes", href: "/dashboard/teacher" },
  { icon: QrCode, label: "Generate QR", href: "/generate-qr" },
  { icon: Users, label: "Students", href: "/dashboard/teacher" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/teacher" },
];

const MOCK_ACTIVITY = [
  { event: "QR session started", detail: "Mathematics 10A", time: "2 min ago", type: "qr" },
  { event: "Attendance recorded", detail: "Physics 11B — 28/30 present", time: "1 hr ago", type: "check" },
  { event: "QR session expired", detail: "Chemistry 10C", time: "3 hrs ago", type: "clock" },
  { event: "Student marked absent", detail: "English 9A — Raj Kumar", time: "Yesterday", type: "user" },
];

const TREND_DATA = [
  { day: "Mon", rate: 82 },
  { day: "Tue", rate: 88 },
  { day: "Wed", rate: 75 },
  { day: "Thu", rate: 91 },
  { day: "Fri", rate: 85 },
  { day: "Sat", rate: 78 },
  { day: "Sun", rate: 88 },
];

const FALLBACK_CLASSES = [
  { id: "1", name: "Mathematics 10A", subject: "Mathematics", student_count: 32 },
  { id: "2", name: "Physics 11B", subject: "Physics", student_count: 28 },
  { id: "3", name: "Computer Science 12A", subject: "Computer Science", student_count: 25 },
  { id: "4", name: "Chemistry 10C", subject: "Chemistry", student_count: 30 },
];

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  student_count?: number;
}

interface TeacherData {
  profile: { full_name: string | null; id: string } | null;
  classes: ClassItem[];
}

const fetchTeacherData = async (): Promise<TeacherData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  const { data: classRows } = await supabase
    .from("classes")
    .select("id, name, subject, class_enrollments(count)")
    .eq("teacher_id", user.id);

  const classes: ClassItem[] = classRows && classRows.length > 0
    ? classRows.map((c) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        student_count: (c.class_enrollments as { count: number }[])?.[0]?.count ?? 0,
      }))
    : FALLBACK_CLASSES;

  return { profile, classes };
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "qr": return <QrCode className="h-3.5 w-3.5 text-primary" aria-hidden="true" />;
    case "check": return <CheckCircle className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />;
    case "clock": return <Clock className="h-3.5 w-3.5 text-yellow-400" aria-hidden="true" />;
    case "user": return <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />;
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />;
  }
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["teacherDashboard"],
    queryFn: fetchTeacherData,
  });

  if (isError) {
    toast({ title: "Error loading dashboard", description: "Some data may be unavailable.", variant: "destructive" });
  }

  const profile = data?.profile ?? null;
  const classes = data?.classes ?? FALLBACK_CLASSES;
  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count ?? 28), 0);

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title="Teacher Dashboard"
      userRole="teacher"
      userName={profile?.full_name ?? ""}
    >
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Dashboard statistics">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard label="Total Students" value={totalStudents.toString()} icon={Users} iconColor="text-purple-400" iconBg="bg-purple-400/10" />
              <StatCard label="Classes" value={classes.length.toString()} icon={BookOpen} iconColor="text-primary" iconBg="bg-primary/10" />
              <StatCard label="Today's Sessions" value="3" icon={Clock} iconColor="text-orange-400" iconBg="bg-orange-400/10" />
              <StatCard label="Avg Attendance" value="88%" icon={TrendingUp} iconColor="text-green-400" iconBg="bg-green-400/10" trend={{ value: "+1.2%", up: true }} />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Classes */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Your Classes</h2>
                <p className="text-xs text-muted-foreground">Managing {classes.length} classes</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 gap-1 text-xs min-h-[36px]"
                aria-label="Add a new class"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add Class
              </Button>
            </div>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" aria-hidden="true" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No classes yet"
                description="Create your first class to start generating QR codes."
                action={{ label: "Add Class", onClick: () => {} }}
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3" role="list" aria-label="Your classes">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:border-primary/30 hover:bg-white/[0.07] transition-all cursor-pointer"
                    onClick={() => navigate("/generate-qr")}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/generate-qr")}
                    aria-label={`${cls.name} - click to generate QR`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs hover:bg-green-500/10">Active</Badge>
                    </div>
                    <p className="text-sm font-semibold">{cls.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cls.subject}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {cls.student_count ?? 28} students
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); navigate("/generate-qr"); }}
                      aria-label={`Generate QR for ${cls.name}`}
                    >
                      <QrCode className="h-3 w-3 mr-1" aria-hidden="true" /> Generate QR
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-1">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mb-4">Latest attendance events</p>
            <div className="space-y-3" role="list" aria-label="Recent activity">
              {MOCK_ACTIVITY.map((item, i) => (
                <div key={i} className="flex gap-3" role="listitem">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.event}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    <p className="text-xs text-muted-foreground/60">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance trend */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Weekly Attendance Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">Across all classes — last 7 days</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(215,20%,65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215,20%,65%)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: 12 }}
                formatter={(value: number) => [`${value}%`, "Attendance rate"]}
              />
              <Area type="monotone" dataKey="rate" stroke="hsl(239,84%,67%)" fill="url(#teacherGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
