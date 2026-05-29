import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

type UserRole = "student" | "teacher" | "parent" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { session, loading, userRole } = useAuth();
  const { toast } = useToast();

  const roleMismatch = !loading && session && requiredRole && userRole !== null && userRole !== requiredRole;

  useEffect(() => {
    if (roleMismatch) {
      toast({ title: "Access denied", description: "You don't have permission to view this page.", variant: "destructive" });
    }
  }, [roleMismatch, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Authenticating">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/25">
            <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (roleMismatch) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
