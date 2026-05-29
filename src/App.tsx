import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const Index = lazy(() => import("./pages/landing/Home"));
const Auth = lazy(() => import("./pages/auth/Auth"));
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./pages/dashboard/TeacherDashboard"));
const GenerateQR = lazy(() => import("./pages/attendance/GenerateQR"));
const ScanQR = lazy(() => import("./pages/attendance/ScanQR"));
const ParentDashboard = lazy(() => import("./pages/dashboard/ParentDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const PageLoader = () => (
  <div
    className="min-h-screen bg-background flex items-center justify-center"
    role="status"
    aria-label="Loading page"
  >
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/teacher"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-qr"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <GenerateQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <ProtectedRoute requiredRole="student">
                    <ScanQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/parent"
                element={
                  <ProtectedRoute requiredRole="parent">
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
