import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  QrCode, LayoutDashboard, CalendarCheck, Clock, User,
  TrendingUp, AlertTriangle, CheckCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import { SkeletonStatCard } from "@/components/common/SkeletonCard";
import EmptyState from "@/components/common/EmptyState";
import StatCard from "@/components/common/StatCard";
import DashboardLayout, { NavItem } from "@/components/layout/DashboardLayout";

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
  { icon: CalendarCheck, label: "Attendance", href: "/dashboard/student" },
  { icon: Clock, label: "Schedule", href: "/dashboard/student" },
  { icon: User, label: "Profile", href: "/dashboard/student" },
];

const TODAY_CLASSES = [
  { subject: "Mathematics", time: "09:00 AM", teacher: "Mr. Singh", room: "Room 201", status: "attended" },
  { subject: "Physics", time: "11:00 AM", teacher: "Dr. Rao", room: "Lab B", status: "attended" },
  { subject: "Computer Science", time: "02:00 PM", teacher: "Ms. Patel", room: "Room 305", status: "upcoming" },
  { subject: "English", time: "04:00 PM", teacher: "Mr. Kumar", room: "Room 102", status: "upcoming" },
];

const WEEKLY_DATA = [
  { week: "Week 1", present: 18, total: 20 },
  { week: "Week 2", present: 17, total: 20 },
  { week: "Week 3", present: 19, total: 20 },
  { week: "Week 4", present: 20, total: 20 },
];

const PIE_COLORS = ["hsl(239,84%,67%)", "hsl(0,84%,60%)", "hsl(38,92%,50%)"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "present":
    case "attended":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 gap-1">
          <CheckCircle className="h-3 w-3" aria-hidden="true" /> Present
        </Badge>
      );
    case "absent":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20 gap-1">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Absent
        </Badge>
      );
    case "late":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" /> Late
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-white/10 text-muted-foreground border-white/10 hover:bg-white/10">
          Upcoming
        </Badge>
      );
    default:
      return null;
  }
};

interface AttendanceRecord {
  id: string;
  status: string;
  marked_at: string | null;
  attendance_sessions: {
    classes: { name: string; subject: string } | null;
  } | null;
}

interface StudentData {
  profile: { full_name: string | null; id: string } | null;
  attendancePercentage: number;
  presentCount: number;
  totalCount: number;
  recentRecords: AttendanceRecord[];
}

const fetchStudentData = async (): Promise<StudentData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .single();

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!student) {
    return { profile, attendancePercentage: 0, presentCount: 0, totalCount: 0, recentRecords: [] };
  }

  const { data: records } = await supabase
    .from("attendance_records")
    .select("id, status, marked_at, attendance_sessions(classes(name, subject))")
    .eq("student_id", student.id)
    .order("marked_at", { ascending: false })
    .limit(20);

  const allRecords = (records ?? []) as AttendanceRecord[];
  const presentCount = allRecords.filter((r) => r.status === "present").length;
  const totalCount = allRecords.length;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 78;

  return { profile, attendancePercentage, presentCount, totalCount, recentRecords: allRecords };
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: fetchStudentData,
  });

  if (isError) {
    toast({ title: "Error loading dashboard", description: "Some data may be unavailable.", variant: "destructive" });
  }

  const attendancePercentage = data?.attendancePercentage ?? 78;
  const profile = data?.profile ?? null;
  const recentRecords = data?.recentRecords ?? [];

  const pieData = [
    { name: "Present", value: attendancePercentage },
    { name: "Absent", value: Math.max(0, 100 - attendancePercentage - 5) },
    { name: "Late", value: 5 },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title="Student Dashboard"
      userRole="student"
      userName={profile?.full_name ?? ""}
    >
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-lg font-semibold">{greeting}, {firstName}</h2>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Attendance statistics">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Overall Attendance"
                value={`${attendancePercentage}%`}
                icon={TrendingUp}
                iconColor="text-primary"
                iconBg="bg-primary/10"
                warning={attendancePercentage < 65}
              />
              <StatCard
                label="Classes Today"
                value="4"
                icon={CalendarCheck}
                iconColor="text-purple-400"
                iconBg="bg-purple-400/10"
              />
              <StatCard
                label="Current Streak"
                value="12 days"
                icon={TrendingUp}
                iconColor="text-green-400"
                iconBg="bg-green-400/10"
                trend={{ value: "+3", up: true }}
              />
              <StatCard
                label="Missed This Month"
                value={String(Math.max(0, (data?.totalCount ?? 0) - (data?.presentCount ?? 0)))}
                icon={AlertTriangle}
                iconColor="text-orange-400"
                iconBg="bg-orange-400/10"
              />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly trend chart */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-1">Weekly Attendance Trend</h2>
            <p className="text-xs text-muted-foreground mb-4">Last 4 weeks</p>
            {isLoading ? (
              <div className="h-40 bg-white/5 rounded-lg animate-pulse" aria-label="Loading chart" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={WEEKLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239,84%,67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: "hsl(215,20%,65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215,20%,65%)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 20]} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: 12 }}
                    formatter={(value: number) => [`${value} classes`]}
                  />
                  <Area type="monotone" dataKey="present" stroke="hsl(239,84%,67%)" fill="url(#areaGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut chart */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-1">Attendance Breakdown</h2>
            <p className="text-xs text-muted-foreground mb-4">Present / Absent / Late</p>
            {isLoading ? (
              <div className="h-40 bg-white/5 rounded-lg animate-pulse" aria-label="Loading chart" />
            ) : (
              <>
                <div className="relative h-40" role="img" aria-label={`Attendance breakdown: ${attendancePercentage}% present`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: 12 }}
                        formatter={(value: number) => [`${value}%`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-xl font-bold">{attendancePercentage}%</div>
                      <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {pieData.map(({ name }, i) => (
                    <div key={name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} aria-hidden="true" />
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
                {attendancePercentage < 65 && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2" role="alert">
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-red-400">Below 65% minimum — action required</p>
                  </div>
                )}
              </>
            )}
            <Button
              onClick={() => navigate("/scan")}
              className="w-full mt-4 bg-primary hover:bg-primary/90 gap-2 min-h-[44px]"
              aria-label="Scan QR code to mark attendance now"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Scan QR Code
            </Button>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Today's Schedule</h2>
          <p className="text-xs text-muted-foreground mb-4">{today}</p>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" aria-hidden="true" />
              ))}
            </div>
          ) : TODAY_CLASSES.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No classes today" description="You have no scheduled classes for today." />
          ) : (
            <div className="space-y-2" role="list" aria-label="Today's classes">
              {TODAY_CLASSES.map((cls) => (
                <div
                  key={cls.subject + cls.time}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${cls.status === "attended" ? "bg-green-400" : "bg-muted-foreground"}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium">{cls.subject}</p>
                      <p className="text-xs text-muted-foreground">{cls.time} &bull; {cls.teacher} &bull; {cls.room}</p>
                    </div>
                  </div>
                  {getStatusBadge(cls.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent history */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Recent Attendance History</h2>
          <p className="text-xs text-muted-foreground mb-4">Last 20 records</p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" aria-hidden="true" />
              ))}
            </div>
          ) : recentRecords.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No records yet" description="Your attendance history will appear here after your first class." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Date</th>
                    <th scope="col" className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Class</th>
                    <th scope="col" className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">
                        {record.marked_at ? new Date(record.marked_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-sm font-medium">
                        {record.attendance_sessions?.classes?.name ?? "Unknown"}
                      </td>
                      <td className="py-2.5 px-3">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
