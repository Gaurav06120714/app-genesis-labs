import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { User, Session } from "@supabase/supabase-js";

type UserRole = "student" | "teacher" | "parent" | "admin";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserRole(currentSession.user.id);
        } else {
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchUserRole(currentSession.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (data?.role) {
      const role = data.role as UserRole;
      setUserRole(role);
      redirectToDashboard(role);
    }
  };

  const redirectToDashboard = (role: UserRole) => {
    const ROLE_ROUTES: Record<UserRole, string> = {
      student: "/dashboard/student",
      teacher: "/dashboard/teacher",
      parent: "/dashboard/parent",
      admin: "/dashboard/admin",
    };
    navigate(ROLE_ROUTES[role] ?? "/");
  };

  return { user, session, loading, userRole };
};
