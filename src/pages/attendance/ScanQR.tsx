import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, QrCode, CheckCircle, AlertTriangle, Camera, Keyboard, XCircle, Clock
} from "lucide-react";

type ResultState = "success" | "error" | "expired" | "duplicate" | null;

const SUPABASE_ERROR_MAP: Record<string, ResultState> = {
  "QR code expired": "expired",
  "Already marked": "duplicate",
};

const ScanQR = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [className, setClassName] = useState("");
  const [markedAt, setMarkedAt] = useState("");
  const [tab, setTab] = useState<"camera" | "manual">("camera");

  // Auto-fill from URL param
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode);
      setTab("manual");
    }
  }, [searchParams]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    setLoading(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated. Please sign in.");

      const { data: session, error: sessionError } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("qr_code_data", trimmedCode)
        .single();

      if (sessionError || !session) {
        setResult("error");
        setResultMessage("Invalid QR code. Please double-check the code and try again.");
        return;
      }

      if (new Date(session.qr_expires_at) < new Date()) {
        setResult("expired");
        setResultMessage("This QR code has expired. Ask your teacher to regenerate a new one.");
        return;
      }

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!student) {
        setResult("error");
        setResultMessage("Student profile not found. Contact your administrator to set up your account.");
        return;
      }

      const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("session_id", session.id)
        .eq("student_id", student.id)
        .single();

      if (existing) {
        setResult("duplicate");
        setResultMessage("Your attendance was already marked for this session.");
        return;
      }

      const now = new Date().toISOString();
      const { error: insertError } = await supabase
        .from("attendance_records")
        .insert({
          session_id: session.id,
          student_id: student.id,
          status: "present",
          marked_at: now,
          verification_method: "qr_code",
        });

      if (insertError) throw insertError;

      const ts = new Date(now).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      setMarkedAt(ts);

      // Try to get class name
      const { data: cls } = await supabase.from("classes").select("name").eq("id", session.class_id).single();
      if (cls) setClassName(cls.name);

      setResult("success");
      setResultMessage("Your attendance has been successfully recorded!");
      setCode("");
      toast({ title: "Attendance Marked!", description: "You're marked present for this session." });

    } catch (err: unknown) {
      setResult("error");
      setResultMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code, toast]);

  const resultConfig = {
    success: {
      icon: CheckCircle,
      iconClass: "text-green-400",
      bgClass: "bg-green-500/10 border-green-500/20",
      title: "Attendance Recorded!",
      titleClass: "text-green-400",
    },
    expired: {
      icon: Clock,
      iconClass: "text-yellow-400",
      bgClass: "bg-yellow-500/10 border-yellow-500/20",
      title: "QR Code Expired",
      titleClass: "text-yellow-400",
    },
    duplicate: {
      icon: XCircle,
      iconClass: "text-orange-400",
      bgClass: "bg-orange-500/10 border-orange-500/20",
      title: "Already Marked",
      titleClass: "text-orange-400",
    },
    error: {
      icon: AlertTriangle,
      iconClass: "text-red-400",
      bgClass: "bg-red-500/10 border-red-500/20",
      title: "Error",
      titleClass: "text-red-400",
    },
  };

  return (
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/student")}
            className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
            aria-label="Back to student dashboard"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-base font-semibold">Mark Attendance</h1>
            <p className="text-xs text-muted-foreground">Scan QR or enter code manually</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-sm hidden sm:inline">
            ATTENDO
          </span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-lg">
        {/* Tab switch */}
        <div
          className="flex gap-2 mb-6 bg-white/5 border border-white/10 rounded-xl p-1"
          role="tablist"
          aria-label="Scan method"
        >
          {[
            { value: "camera", icon: Camera, label: "Camera Scan" },
            { value: "manual", icon: Keyboard, label: "Enter Code" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTab(value as "camera" | "manual")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                tab === value ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              role="tab"
              aria-selected={tab === value}
              aria-controls={`tabpanel-${value}`}
              id={`tab-${value}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {tab === "camera" ? (
          <div
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center"
            role="tabpanel"
            id="tabpanel-camera"
            aria-labelledby="tab-camera"
          >
            <div
              className="relative mx-auto w-64 h-64 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-6 overflow-hidden"
              aria-label="Camera viewfinder placeholder"
            >
              <div className="absolute inset-4 border-2 border-primary/40 rounded-xl" aria-hidden="true" />
              {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2",
                "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"
              ].map((cls) => (
                <div key={cls} className={`absolute w-5 h-5 border-primary ${cls}`} aria-hidden="true" />
              ))}
              <QrCode className="h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
              <p className="text-xs text-muted-foreground/60 mt-2 px-4">Camera requires native app</p>
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-left mb-4" role="note">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Camera scanning unavailable</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Camera QR scanning requires the native mobile app. Use "Enter Code" to input the session code shown by your teacher.
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full border-white/10 hover:bg-white/5 min-h-[44px]"
              variant="outline"
              onClick={() => setTab("manual")}
              aria-label="Switch to manual code entry"
            >
              Switch to Manual Entry
            </Button>
          </div>
        ) : (
          <div
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            role="tabpanel"
            id="tabpanel-manual"
            aria-labelledby="tab-manual"
          >
            {result === "success" ? (
              /* Success state */
              <div className="text-center py-6 animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-10 w-10 text-green-400" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-green-400 mb-2">Attendance Recorded!</h2>
                <p className="text-sm text-muted-foreground mb-4">{resultMessage}</p>
                {className && (
                  <div className="mb-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400 inline-block">
                    {className}
                  </div>
                )}
                {markedAt && (
                  <p className="text-xs text-muted-foreground">Marked at {markedAt}</p>
                )}
                <Button
                  className="mt-6 w-full bg-primary hover:bg-primary/90 min-h-[44px]"
                  onClick={() => { setResult(null); setCode(""); }}
                  aria-label="Scan another QR code"
                >
                  Scan Another
                </Button>
                <Button
                  variant="ghost"
                  className="mt-2 w-full text-muted-foreground"
                  onClick={() => navigate("/dashboard/student")}
                  aria-label="Return to student dashboard"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <QrCode className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">Enter the session code from your teacher's screen</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-code" className="text-sm font-medium">Session Code</Label>
                    <Input
                      id="qr-code"
                      placeholder="e.g. 550e8400-e29b-41d4-a716..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-primary h-12 font-mono text-sm"
                      required
                      aria-required="true"
                      aria-describedby="qr-code-hint"
                    />
                    <p id="qr-code-hint" className="text-xs text-muted-foreground">
                      Find this code on your teacher's QR screen
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !code.trim()}
                    className="w-full h-12 bg-primary hover:bg-primary/90 font-medium gap-2"
                    aria-label={loading ? "Marking attendance, please wait" : "Mark attendance"}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        Marking attendance...
                      </>
                    ) : (
                      <><CheckCircle className="h-4 w-4" aria-hidden="true" /> Mark Attendance</>
                    )}
                  </Button>
                </form>

                {result && result !== "success" && (() => {
                  const cfg = resultConfig[result];
                  const Icon = cfg.icon;
                  return (
                    <div
                      className={`mt-4 p-4 rounded-xl border flex gap-3 animate-fade-in ${cfg.bgClass}`}
                      role="alert"
                      aria-live="assertive"
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cfg.iconClass}`} aria-hidden="true" />
                      <div>
                        <p className={`text-sm font-medium ${cfg.titleClass}`}>{cfg.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{resultMessage}</p>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {result !== "success" && (
          <p className="text-center mt-4">
            <button
              onClick={() => navigate("/dashboard/student")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
              aria-label="Return to student dashboard"
            >
              ← Back to dashboard
            </button>
          </p>
        )}
      </main>
    </div>
  );
};

export default ScanQR;
