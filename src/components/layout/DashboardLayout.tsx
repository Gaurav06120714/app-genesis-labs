import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import {
  CheckCircle, LogOut, Bell, Menu, ChevronLeft, ChevronRight, User
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  userRole: "student" | "teacher" | "parent" | "admin";
  userName?: string;
}

const SIDEBAR_KEY = "attendo_sidebar_collapsed";

const ROLE_COLORS: Record<string, string> = {
  student: "text-indigo-400",
  teacher: "text-blue-400",
  parent: "text-purple-400",
  admin: "text-orange-400",
};

const SidebarContent = ({
  navItems,
  collapsed,
  userName,
  userRole,
  onNavClick,
  onLogout,
}: {
  navItems: NavItem[];
  collapsed: boolean;
  userName: string;
  userRole: string;
  onNavClick: () => void;
  onLogout: () => void;
}) => {
  const location = useLocation();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 border-b border-border flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ATTENDO
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = location.pathname === href;
          const btn = (
            <Link
              key={label}
              to={href}
              onClick={onNavClick}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px]
                ${collapsed ? "justify-center" : ""}
                ${isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"}
              `}
              aria-current={isActive ? "page" : undefined}
              aria-label={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {!collapsed && label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={label} delayDuration={100}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return btn;
        })}
      </nav>

      {/* User info + logout */}
      <div className={`p-3 border-t border-border space-y-2`}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
              {initials || <User className="h-4 w-4" aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{userName || "User"}</p>
              <p className={`text-xs capitalize ${ROLE_COLORS[userRole] ?? "text-muted-foreground"}`}>{userRole}</p>
            </div>
          </div>
        )}
        {collapsed ? (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all min-h-[44px]"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all min-h-[44px]"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

const DashboardLayout = ({
  children,
  navItems,
  title,
  userRole,
  userName = "",
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  }, [navigate]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Bottom nav items (first 5)
  const bottomNavItems = navItems.slice(0, 5);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex dark">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col bg-card border-r border-border transition-all duration-300
          ${collapsed ? "w-16" : "w-60"}
        `}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        <div className="flex-1 overflow-y-auto">
          <SidebarContent
            navItems={navItems}
            collapsed={collapsed}
            userName={userName}
            userRole={userRole}
            onNavClick={() => {}}
            onLogout={handleLogout}
          />
        </div>
        {/* Collapse toggle */}
        <div className={`p-3 border-t border-border flex ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={toggleCollapsed}
            className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-card border-border">
          <SidebarContent
            navItems={navItems}
            collapsed={false}
            userName={userName}
            userRole={userRole}
            onNavClick={closeMobile}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {userName ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : <User className="h-4 w-4" aria-hidden="true" />}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border backdrop-blur-lg"
        style={{ height: 64, paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-full">
          {bottomNavItems.map(({ label, icon: Icon, href }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={label}
                to={href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
