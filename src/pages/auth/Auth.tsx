import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  CheckCircle, Eye, EyeOff, QrCode, Shield, Users,
  TrendingUp, ArrowRight, GraduationCap, Settings
} from "lucide-react";

// Password strength helper
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-yellow-500" },
    { score: 3, label: "Good", color: "bg-blue-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
  ];
  return levels[score - 1] ?? { score: 0, label: "", color: "" };
};

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

const SUPABASE_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Incorrect email or password. Please try again.",
  "Email not confirmed": "Please verify your email before signing in.",
  "User already registered": "An account with this email already exists. Try signing in.",
  "Password should be at least 6 characters": "Password must be at least 6 characters.",
  "Unable to validate email address: invalid format": "Please enter a valid email address.",
  "signup_disabled": "New registrations are currently disabled. Contact support.",
};

const mapSupabaseError = (message: string): string => {
  return SUPABASE_ERROR_MAP[message] || message || "Something went wrong. Please try again.";
};

type Role = "student" | "teacher" | "parent" | "admin";

const ROLES: { value: Role; label: string; icon: typeof GraduationCap; description: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, description: "Mark attendance via QR" },
  { value: "teacher", label: "Teacher", icon: QrCode, description: "Generate QR sessions" },
  { value: "parent", label: "Parent", icon: Users, description: "Monitor your child" },
  { value: "admin", label: "Admin", icon: Settings, description: "Full system access" },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", fullName: "" });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      loginSchema.parse(loginData);
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
    } catch (error: unknown) {
      const message = error instanceof z.ZodError
        ? error.errors[0].message
        : error instanceof Error
          ? mapSupabaseError(error.message)
          : "Login failed. Please try again.";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [loginData, toast]);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      signupSchema.parse(signupData);
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            role: selectedRole,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast({
        title: "Account created!",
        description: "Check your email to verify your account before signing in.",
      });
      setActiveTab("login");
    } catch (error: unknown) {
      const message = error instanceof z.ZodError
        ? error.errors[0].message
        : error instanceof Error
          ? mapSupabaseError(error.message)
          : "Could not create account. Please try again.";
      toast({ title: "Sign up failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [signupData, selectedRole, toast]);

  const handleGoogleAuth = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  const handleForgotPassword = useCallback(() => {
    toast({
      title: "Password reset",
      description: "Enter your email and we'll send a reset link. Feature coming soon.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-indigo-900/40 via-background to-purple-900/30 border-r border-border/40 p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ATTENDO
          </span>
        </div>

        {/* Mid content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
              Attendance management{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                made simple
              </span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Secure QR-based attendance for educational institutions. Real-time tracking, instant notifications, zero fraud.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: QrCode, text: "Generate & scan QR codes instantly" },
              { icon: Shield, text: "Multi-layer verification prevents proxy attendance" },
              { icon: Users, text: "Parents get live attendance updates" },
              { icon: TrendingUp, text: "Detailed analytics and trend reports" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Floating stat cards */}
          <div className="space-y-3">
            {[
              { label: "Overall Attendance", value: "87.4%", change: "+2.1% this month", color: "text-green-400" },
              { label: "Students Present Today", value: "248 / 284", change: "12 sessions active", color: "text-indigo-400" },
            ].map((card) => (
              <div key={card.label} className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{card.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative">
          <p className="text-xs text-muted-foreground">
            Trusted by <span className="font-medium text-foreground">500+ institutions</span> &bull; <span className="font-medium text-foreground">10,000+ students</span>
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ATTENDO
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1 tracking-tight">
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeTab === "login"
                ? "Sign in to your ATTENDO account"
                : "Get started — it's free forever for small institutions"}
            </p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border/60 hover:bg-muted/30 gap-3 mb-4"
            onClick={handleGoogleAuth}
            aria-label="Continue with Google"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border/60" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border/60" aria-hidden="true" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-border/40 mb-6 h-10">
              <TabsTrigger
                value="login"
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-fade-in">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@school.edu"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="h-11 bg-muted/20 border-border/60 focus:border-primary"
                    required
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:underline"
                      aria-label="Request password reset"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-11 bg-muted/20 border-border/60 focus:border-primary pr-10"
                      required
                      autoComplete="current-password"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw(!showLoginPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      aria-label={showLoginPw ? "Hide password" : "Show password"}
                    >
                      {showLoginPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 font-medium gap-2"
                  disabled={isLoading}
                  aria-label={isLoading ? "Signing in, please wait" : "Sign in to your account"}
                >
                  {isLoading ? "Signing in..." : (
                    <>Sign In <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="animate-fade-in">
              <form onSubmit={handleSignup} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    className="h-11 bg-muted/20 border-border/60 focus:border-primary"
                    required
                    autoComplete="name"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@school.edu"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="h-11 bg-muted/20 border-border/60 focus:border-primary"
                    required
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="h-11 bg-muted/20 border-border/60 focus:border-primary pr-10"
                      required
                      autoComplete="new-password"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPw(!showSignupPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      aria-label={showSignupPw ? "Hide password" : "Show password"}
                    >
                      {showSignupPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {signupData.password && (() => {
                    const strength = getPasswordStrength(signupData.password);
                    return (
                      <div className="space-y-1">
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                i <= strength.score ? strength.color : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${
                          strength.score <= 1 ? "text-red-400" :
                          strength.score === 2 ? "text-yellow-400" :
                          strength.score === 3 ? "text-blue-400" : "text-green-400"
                        }`}>
                          {strength.label} password
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Role selector */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">I am a...</Label>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select your role">
                    {ROLES.map(({ value, label, icon: Icon, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedRole(value)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          selectedRole === value
                            ? "bg-primary/10 border-primary/40 text-foreground"
                            : "bg-muted/20 border-border/40 text-muted-foreground hover:border-border/60"
                        }`}
                        aria-pressed={selectedRole === value}
                        aria-label={`Select ${label} role: ${description}`}
                      >
                        <Icon className={`h-4 w-4 ${selectedRole === value ? "text-primary" : ""}`} aria-hidden="true" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 font-medium gap-2"
                  disabled={isLoading}
                  aria-label={isLoading ? "Creating account, please wait" : "Create your free account"}
                >
                  {isLoading ? "Creating account..." : (
                    <>Create Account <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline focus-visible:outline-none focus-visible:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline focus-visible:outline-none focus-visible:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
