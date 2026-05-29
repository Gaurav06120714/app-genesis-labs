import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode, ArrowLeft, RefreshCw, Clock, CheckCircle, BookOpen, Copy, Link
} from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  subject: string;
}

interface Session {
  id: string;
  class_id: string;
  teacher_id: string;
  qr_code_data: string;
  qr_expires_at: string;
  session_date: string;
}

const FALLBACK_CLASSES: ClassItem[] = [
  { id: "mock-1", name: "Mathematics 10A", subject: "Mathematics" },
  { id: "mock-2", name: "Physics 11B", subject: "Physics" },
  { id: "mock-3", name: "Computer Science 12A", subject: "Computer Science" },
];

const SESSION_DURATION_SECONDS = 15 * 60;

const GenerateQR = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [autoRegen, setAutoRegen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchClasses();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (session) startCountdown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session]);

  const fetchClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("classes").select("id, name, subject").eq("teacher_id", user.id);
    setClasses(data && data.length > 0 ? data : FALLBACK_CLASSES);
  };

  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!session?.qr_expires_at) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(session.qr_expires_at).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoRegen) generateQR();
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
  }, [session, autoRegen]);

  const generateQR = useCallback(async () => {
    if (!selectedClass) {
      toast({ title: "Select a class", description: "Please select a class first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const qrCodeData = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString();

      if (!selectedClass.id.startsWith("mock-")) {
        const { data, error } = await supabase
          .from("attendance_sessions")
          .insert({
            class_id: selectedClass.id,
            teacher_id: user.id,
            session_date: new Date().toISOString().split("T")[0],
            qr_code_data: qrCodeData,
            qr_expires_at: expiresAt,
          })
          .select()
          .single();
        if (error) throw error;
        setSession(data as Session);
      } else {
        setSession({
          id: crypto.randomUUID(),
          class_id: selectedClass.id,
          teacher_id: user.id,
          qr_code_data: qrCodeData,
          qr_expires_at: expiresAt,
          session_date: new Date().toISOString().split("T")[0],
        });
      }
      toast({ title: "QR Code Generated", description: "Students can now scan to mark attendance." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate QR code";
      toast({ title: "Failed to generate QR", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, toast]);

  const copyShareLink = useCallback(() => {
    if (!session) return;
    const url = `${window.location.origin}/scan?code=${session.qr_code_data}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied", description: "Share this link with students." });
    });
  }, [session, toast]);

  const copyCode = useCallback(() => {
    if (!session) return;
    navigator.clipboard.writeText(session.qr_code_data).then(() => {
      toast({ title: "Code copied", description: "Session code copied to clipboard." });
    });
  }, [session, toast]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPct = session ? (secondsLeft / SESSION_DURATION_SECONDS) * 100 : 0;
  const isExpired = session && secondsLeft === 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/teacher")}
            className="text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
            aria-label="Back to teacher dashboard"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-base font-semibold">Generate QR Code</h1>
            <p className="text-xs text-muted-foreground">Create attendance sessions for your classes</p>
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

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: class selection */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-3">Select Class</h2>
              <div className="space-y-2" role="list" aria-label="Available classes">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => { setSelectedClass(cls); setSession(null); }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${selectedClass?.id === cls.id
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"}
                    `}
                    role="option"
                    aria-selected={selectedClass?.id === cls.id}
                    aria-label={`Select ${cls.name}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedClass?.id === cls.id ? "bg-primary/20" : "bg-white/10"}`}>
                      <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">{cls.subject}</p>
                    </div>
                    {selectedClass?.id === cls.id && (
                      <CheckCircle className="h-4 w-4 text-primary ml-auto flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateQR}
              disabled={loading || !selectedClass}
              className="w-full h-12 bg-primary hover:bg-primary/90 font-medium gap-2"
              aria-label={session ? "Regenerate QR code" : "Generate QR code"}
            >
              {loading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> Generating...</>
              ) : session ? (
                <><RefreshCw className="h-4 w-4" aria-hidden="true" /> Regenerate QR</>
              ) : (
                <><QrCode className="h-4 w-4" aria-hidden="true" /> Generate QR Code</>
              )}
            </Button>

            {/* Auto-regen toggle */}
            {session && (
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-xs font-medium">Auto-regenerate</p>
                  <p className="text-xs text-muted-foreground">Regenerate when expired</p>
                </div>
                <button
                  onClick={() => setAutoRegen(!autoRegen)}
                  className={`relative w-10 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${autoRegen ? "bg-primary" : "bg-white/20"}`}
                  role="switch"
                  aria-checked={autoRegen}
                  aria-label="Toggle auto-regenerate"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoRegen ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            )}

            {/* Session info */}
            {session && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs">
                {[
                  { label: "Session ID", value: session.id.slice(0, 8) + "..." },
                  { label: "Class", value: selectedClass?.name || "" },
                  { label: "Date", value: new Date().toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/5 gap-1.5 text-xs h-8" onClick={copyCode} aria-label="Copy session code">
                    <Copy className="h-3 w-3" aria-hidden="true" /> Copy Code
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/5 gap-1.5 text-xs h-8" onClick={copyShareLink} aria-label="Copy share link">
                    <Link className="h-3 w-3" aria-hidden="true" /> Share Link
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: QR display */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-80">
            {!session ? (
              <div className="text-center">
                <div className="w-32 h-32 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-14 w-14 text-muted-foreground/30" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium">No QR Code Yet</p>
                <p className="text-xs text-muted-foreground mt-1">Select a class and click Generate</p>
              </div>
            ) : (
              <div className="text-center w-full flex flex-col items-center">
                {/* Animated ring */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg width="136" height="136" viewBox="0 0 136 136" className="absolute -rotate-90" aria-hidden="true">
                    <circle
                      cx="68" cy="68" r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="68" cy="68" r="54"
                      fill="none"
                      stroke={secondsLeft < 60 ? "hsl(0,84%,60%)" : "hsl(239,84%,67%)"}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progressPct / 100)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
                    />
                  </svg>
                  <div className={`relative p-3 rounded-2xl border-2 transition-all ${isExpired ? "border-red-500/40 opacity-40" : "border-transparent"}`}>
                    {isExpired && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl z-10" role="alert">
                        <div className="text-center">
                          <p className="text-red-400 font-semibold text-sm">QR Expired</p>
                          <p className="text-xs text-muted-foreground">Click Regenerate</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-xl" aria-label="QR code for attendance">
                      <QRCodeSVG
                        value={`${window.location.origin}/scan?code=${session.qr_code_data}`}
                        size={180}
                        level="H"
                      />
                    </div>
                  </div>
                </div>

                {!isExpired && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span
                        className={`text-2xl font-mono font-bold ${secondsLeft < 60 ? "text-red-400" : "text-primary"}`}
                        aria-live="polite"
                        aria-label={`${formatTime(secondsLeft)} remaining`}
                      >
                        {formatTime(secondsLeft)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">remaining</p>
                    <p className="text-xs text-muted-foreground">
                      Show this to students — valid for {Math.floor(SESSION_DURATION_SECONDS / 60)} minutes
                    </p>
                    {selectedClass && (
                      <div className="mt-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium">
                        {selectedClass.name}
                      </div>
                    )}
                  </>
                )}

                {isExpired && (
                  <Button onClick={generateQR} className="mt-4 bg-primary hover:bg-primary/90 gap-2" size="sm">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" /> Regenerate
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateQR;
