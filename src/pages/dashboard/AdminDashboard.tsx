import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/services/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  User, Building2, Users, BookOpen,
  Activity, Shield, Search, TrendingUp, LayoutDashboard, Settings, BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SkeletonStatCard } from "@/components/common/SkeletonCard";
import StatCard from "@/components/common/StatCard";
import DashboardLayout, { NavItem } from "@/components/layout/DashboardLayout";

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
  { icon: Building2, label: "Institutions", href: "/dashboard/admin" },
  { icon: Users, label: "Users", href: "/dashboard/admin" },
  { icon: Activity, label: "Sessions", href: "/dashboard/admin" },
  { icon: BarChart3, label: "Reports", href: "/dashboard/admin" },
  { icon: Settings, label: "Settings", href: "/dashboard/admin" },
];

const MOCK_USERS = [
  { name: "Dr. Priya Patel", email: "priya@school.edu", role: "teacher", institution: "St. Xavier's", status: "active" },
  { name: "Arjun Singh", email: "arjun@school.edu", role: "student", institution: "St. Xavier's", status: "active" },
  { name: "Meera Nair", email: "meera@abc.edu", role: "parent", institution: "ABC Academy", status: "active" },
  { name: "Rahul Verma", email: "rahul@school.edu", role: "teacher", institution: "City College", status: "inactive" },
  { name: "Sneha Kapoor", email: "sneha@school.edu", role: "student", institution: "St. Xavier's", status: "active" },
  { name: "Karan Mehta", email: "karan@abc.edu", role: "admin", institution: "ABC Academy", status: "active" },
];

const MOCK_INSTITUTIONS = [
  { name: "St. Xavier's School", students: 1240, teachers: 48, attendance: 87 },
  { name: "ABC Academy", students: 830, teachers: 32, attendance: 91 },
  { name: "City College", students: 2100, teachers: 95, attendance: 78 },
  { name: "Greenfield High", students: 670, teachers: 28, attendance: 84 },
];

const SESSIONS_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  sessions: Math.floor(Math.random() * 50) + 20,
}));

const ROLE_BADGE: Record<string, string> = {
  teacher: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  student: "bg-green-500/20 text-green-400 border-green-500/30",
  parent: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  admin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id, full_name").eq("id", user.id).single();
  return data;
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: fetchProfile,
  });

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return MOCK_USERS.filter((u) => {
      const matchesSearch = !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.role.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const ROLE_OPTIONS = ["all", "teacher", "student", "parent", "admin"];

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title="Admin Dashboard"
      userRole="admin"
      userName={profile?.full_name ?? ""}
    >
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="System statistics">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <StatCard label="Institutions" value="4" icon={Building2} iconColor="text-primary" iconBg="bg-primary/10" />
              <StatCard label="Total Students" value="4,840" icon={Users} iconColor="text-purple-400" iconBg="bg-purple-400/10" trend={{ value: "+120", up: true }} />
              <StatCard label="Teachers" value="203" icon={BookOpen} iconColor="text-blue-400" iconBg="bg-blue-400/10" />
              <StatCard label="Sessions Today" value="47" icon={Activity} iconColor="text-green-400" iconBg="bg-green-400/10" trend={{ value: "+5", up: true }} />
            </>
          )}
        </div>

        {/* Sessions trend */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Daily Active Sessions</h2>
          <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={SESSIONS_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(215,20%,65%)", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "hsl(215,20%,65%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(222,47%,7%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: 12 }}
                formatter={(value: number) => [`${value} sessions`]}
              />
              <Line type="monotone" dataKey="sessions" stroke="hsl(239,84%,67%)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(239,84%,67%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System health */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "API Status", status: "Operational", color: "text-green-400", bg: "bg-green-400" },
            { label: "Database", status: "Healthy", color: "text-green-400", bg: "bg-green-400" },
            { label: "QR Service", status: "Operational", color: "text-green-400", bg: "bg-green-400" },
          ].map(({ label, status, color, bg }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${bg} shadow-lg`} aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className={`text-xs ${color}`}>{status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Institutions table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Institutions</h2>
              <p className="text-xs text-muted-foreground">All registered institutions</p>
            </div>
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-xs min-h-[36px]" aria-label="Add a new institution">
              Add Institution
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Institutions list">
              <thead>
                <tr className="border-b border-white/10">
                  {["Institution", "Students", "Teachers", "Avg Attendance", "Status"].map((h) => (
                    <th key={h} scope="col" className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INSTITUTIONS.map((inst) => (
                  <tr key={inst.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        </div>
                        <span className="font-medium text-sm">{inst.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">{inst.students.toLocaleString()}</td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">{inst.teachers}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/10 rounded-full h-1.5" role="progressbar" aria-valuenow={inst.attendance} aria-valuemin={0} aria-valuemax={100} aria-label={`${inst.attendance}% attendance`}>
                          <div
                            className={`h-1.5 rounded-full ${inst.attendance >= 85 ? "bg-green-400" : inst.attendance >= 75 ? "bg-yellow-400" : "bg-red-400"}`}
                            style={{ width: `${inst.attendance}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${inst.attendance >= 85 ? "text-green-400" : inst.attendance >= 75 ? "text-yellow-400" : "text-red-400"}`}>
                          {inst.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs hover:bg-green-500/10">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User management */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-semibold">User Management</h2>
              <p className="text-xs text-muted-foreground">{filteredUsers.length} of {MOCK_USERS.length} users</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-white/5 border-white/10 focus:border-primary h-9 text-xs w-48"
                  aria-label="Search users by name, email, or role"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-xs text-foreground focus:outline-none focus:border-primary"
                aria-label="Filter by role"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r} className="bg-background">
                    {r === "all" ? "All roles" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Users list">
              <thead>
                <tr className="border-b border-white/10">
                  {["Name", "Email", "Role", "Institution", "Status"].map((h) => (
                    <th key={h} scope="col" className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <span className="font-medium text-xs">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <Badge className={`text-xs capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{u.institution}</td>
                    <td className="py-2.5 px-3">
                      <Badge className={`text-xs ${u.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${u.status === "active" ? "bg-green-400" : "bg-muted-foreground"}`} aria-hidden="true" />
                        {u.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No users match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
