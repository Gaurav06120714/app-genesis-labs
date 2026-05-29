import { useState, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, Bell, User, CheckCircle, AlertTriangle,
  Calendar, TrendingUp, ChevronDown, ChevronUp, MessageSquare
} from "lucide-react";
import DashboardLayout, { NavItem } from "@/components/layout/DashboardLayout";

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/parent" },
  { icon: Users, label: "Children", href: "/dashboard/parent" },
  { icon: Bell, label: "Notifications", href: "/dashboard/parent" },
  { icon: User, label: "Profile", href: "/dashboard/parent" },
];

const MOCK_CHILDREN = [
  {
    id: "1",
    name: "Aryan Sharma",
    grade: "Grade 10A",
    percentage: 82,
    present: 41,
    total: 50,
    records: [
      { date: "May 27", subject: "Mathematics", status: "present" },
      { date: "May 27", subject: "Physics", status: "present" },
      { date: "May 26", subject: "Chemistry", status: "absent" },
      { date: "May 26", subject: "English", status: "present" },
      { date: "May 25", subject: "Mathematics", status: "present" },
    ],
  },
  {
    id: "2",
    name: "Priya Sharma",
    grade: "Grade 8B",
    percentage: 60,
    present: 30,
    total: 50,
    records: [
      { date: "May 27", subject: "Science", status: "absent" },
      { date: "May 27", subject: "English", status: "present" },
      { date: "May 26", subject: "Maths", status: "absent" },
      { date: "May 26", subject: "History", status: "present" },
      { date: "May 25", subject: "Science", status: "absent" },
    ],
  },
];

const NOTIFICATIONS = [
  { id: 1, type: "alert", message: "Priya's attendance dropped below 65%", time: "2 hrs ago", unread: true },
  { id: 2, type: "info", message: "Aryan marked present for all classes today", time: "3 hrs ago", unread: true },
  { id: 3, type: "alert", message: "Priya was absent for 3 classes yesterday", time: "1 day ago", unread: false },
  { id: 4, type: "info", message: "Monthly attendance report is available", time: "2 days ago", unread: false },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "present":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20 text-xs gap-1">
          <CheckCircle className="h-3 w-3" aria-hidden="true" /> Present
        </Badge>
      );
    case "absent":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/20 text-xs gap-1">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Absent
        </Badge>
      );
    default:
      return null;
  }
};

const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, full_name").eq("id", user.id).single();
  return data;
};

const ParentDashboard = () => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>("1");

  const { data: profile } = useQuery({
    queryKey: ["parentProfile"],
    queryFn: fetchProfile,
  });

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title="Parent Dashboard"
      userRole="parent"
      userName={profile?.full_name ?? ""}
    >
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">Parent Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Monitor your children's attendance in real-time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Children section */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              Your Children ({MOCK_CHILDREN.length})
            </h3>

            {MOCK_CHILDREN.map((child) => (
              <section
                key={child.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                aria-label={`${child.name}'s attendance`}
              >
                <button
                  className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors min-h-[80px]"
                  onClick={() => toggleExpanded(child.id)}
                  aria-expanded={expanded === child.id}
                  aria-controls={`child-details-${child.id}`}
                  aria-label={`${child.name}, ${child.percentage}% attendance. Click to ${expanded === child.id ? "collapse" : "expand"}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold">{child.name}</p>
                      <p className="text-xs text-muted-foreground">{child.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${child.percentage >= 75 ? "text-green-400" : child.percentage >= 65 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {child.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">{child.present}/{child.total} classes</div>
                    </div>
                    {child.percentage < 65 && (
                      <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" aria-label="Low attendance warning" />
                    )}
                    {expanded === child.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    )}
                  </div>
                </button>

                <div className="px-5 pb-3">
                  <div className="w-full bg-white/10 rounded-full h-1.5" role="progressbar" aria-valuenow={child.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${child.percentage}% attendance`}>
                    <div
                      className={`h-1.5 rounded-full transition-all ${child.percentage >= 75 ? "bg-green-400" : child.percentage >= 65 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${child.percentage}%` }}
                    />
                  </div>
                  {child.percentage < 65 && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Below 65% minimum threshold — action required
                    </p>
                  )}
                </div>

                {expanded === child.id && (
                  <div className="border-t border-white/10 p-5" id={`child-details-${child.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-muted-foreground">Recent Attendance</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 hover:bg-white/5 gap-1.5 text-xs h-7"
                        aria-label={`Contact ${child.name}'s teacher`}
                      >
                        <MessageSquare className="h-3 w-3" aria-hidden="true" /> Contact Teacher
                      </Button>
                    </div>
                    <div className="space-y-1.5" role="list" aria-label={`${child.name}'s recent records`}>
                      {child.records.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                          role="listitem"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${rec.status === "present" ? "bg-green-400" : "bg-red-400"}`}
                              aria-hidden="true"
                            />
                            <span className="text-sm">{rec.subject}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{rec.date}</span>
                            {getStatusBadge(rec.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Sidebar: notifications + overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-2" role="list" aria-label="Notifications">
              {NOTIFICATIONS.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border text-xs transition-colors ${
                    notif.type === "alert"
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-white/5 border-white/10"
                  } ${notif.unread ? "opacity-100" : "opacity-70"}`}
                  role="listitem"
                >
                  <div className="flex gap-2">
                    {notif.type === "alert" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <div>
                      <p className={notif.type === "alert" ? "text-red-300" : "text-foreground"}>{notif.message}</p>
                      <p className="text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    {notif.unread && (
                      <div className="ml-auto flex-shrink-0">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full block mt-1" aria-label="Unread" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold">Overview</p>
              {[
                { label: "Children enrolled", value: "2", icon: Users },
                { label: "Alerts this week", value: "3", icon: AlertTriangle },
                { label: "Best attendance", value: "82%", icon: TrendingUp },
                { label: "Total sessions", value: "100", icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </div>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
