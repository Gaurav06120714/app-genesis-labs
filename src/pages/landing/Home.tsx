import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, QrCode, Shield, Users, TrendingUp, Globe, Smartphone,
  ArrowRight, Play, Menu, X, ChevronDown, Bell, BarChart3, Lock,
  Zap, Star, Twitter, Github, Linkedin
} from "lucide-react";

// Animated count-up hook
const useCountUp = (target: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const FEATURES = [
  {
    icon: QrCode,
    title: "QR Code Attendance",
    description: "Generate unique, time-expiring QR codes per class session. Regenerate instantly for maximum security.",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
  {
    icon: Shield,
    title: "Multi-Layer Verification",
    description: "Face + WiFi + Device fingerprint verification prevents proxy attendance with enterprise-grade security.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Dashboard",
    description: "Live attendance updates as students scan. Instant visibility for teachers, admins, and parents.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Bell,
    title: "Parent Notifications",
    description: "Instant alerts when students miss class. Daily summaries and threshold warnings delivered automatically.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Detailed attendance insights, trends, and exportable reports. Data-driven decisions for administrators.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    description: "Separate portals for Admin, Teacher, Student, and Parent — each with contextually appropriate views.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Teacher generates QR",
    description: "Teachers open their dashboard and generate a session-specific QR code with a single click.",
    icon: QrCode,
  },
  {
    number: "02",
    title: "Student scans code",
    description: "Students scan the QR with their phone. Multi-layer verification confirms identity instantly.",
    icon: Smartphone,
  },
  {
    number: "03",
    title: "Records saved instantly",
    description: "Attendance is logged in real-time. Parents and admins see updates the moment they happen.",
    icon: CheckCircle,
  },
];

const TESTIMONIALS = [
  {
    quote: "ATTENDO cut our attendance fraud to nearly zero. The multi-layer verification is incredibly robust.",
    name: "Dr. Sarah Chen",
    role: "Principal, St. Xavier's School",
    avatar: "SC",
    color: "bg-indigo-500",
  },
  {
    quote: "Our teachers save 15 minutes per class. Over a semester, that's thousands of hours reclaimed.",
    name: "James Okafor",
    role: "IT Director, ABC Academy",
    avatar: "JO",
    color: "bg-emerald-500",
  },
  {
    quote: "I finally know if my child is actually in school, in real time. The parent notifications are a game changer.",
    name: "Priya Sharma",
    role: "Parent",
    avatar: "PS",
    color: "bg-purple-500",
  },
];

const FAQS = [
  {
    q: "How does QR verification work?",
    a: "Each session generates a unique QR code that expires after 15 minutes. When a student scans it, we verify their device, location, and optionally facial recognition to confirm authenticity.",
  },
  {
    q: "Can students fake attendance by sharing the QR?",
    a: "No. Each QR code is tied to a session and can only be scanned once per student. Device fingerprinting and optional WiFi verification prevent remote scanning.",
  },
  {
    q: "What happens when there's no internet?",
    a: "ATTENDO caches session data locally. Attendance records are queued and synced automatically when connectivity is restored.",
  },
  {
    q: "Is our student data secure?",
    a: "Yes. All data is encrypted in transit and at rest. We're SOC 2 compliant and follow FERPA guidelines for educational data privacy.",
  },
  {
    q: "Can we integrate with our existing LMS?",
    a: "ATTENDO supports REST API integration with Canvas, Moodle, Blackboard, and Google Classroom. Enterprise plans include custom integration support.",
  },
  {
    q: "How long is the free trial?",
    a: "The Free plan is unlimited in time — up to 50 students at no cost, forever. Pro and Enterprise plans include a 14-day free trial with no credit card required.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for small classes",
    features: ["Up to 50 students", "3 teacher accounts", "Basic QR attendance", "7-day history", "Email support"],
    cta: "Get started free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing institutions",
    features: ["Up to 500 students", "Unlimited teachers", "Advanced analytics", "Parent notifications", "1-year history", "Priority support", "API access"],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large school systems",
    features: ["Unlimited students", "SSO & SAML", "Custom integrations", "Dedicated SLA", "On-premise option", "24/7 support", "Custom training"],
    cta: "Contact sales",
    popular: false,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const count1 = useCountUp(10000, 2000, statsVisible);
  const count2 = useCountUp(500, 2000, statsVisible);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const toggleFaq = useCallback((i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm font-medium"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm"
            : "bg-transparent"
        }`}
        role="banner"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25" aria-hidden="true">
              <CheckCircle className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ATTENDO
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {["#features", "#how-it-works", "#pricing", "#faq"].map((href, i) => {
              const labels = ["Features", "How it Works", "Pricing", "FAQ"];
              return (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label={`Navigate to ${labels[i]} section`}
                >
                  {labels[i]}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-sm"
              aria-label="Sign in to your account"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-sm gap-1.5"
              aria-label="Get started for free"
            >
              Get Started Free <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/60 animate-slide-down"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="container mx-auto px-6 py-4 space-y-1">
              {["#features", "#how-it-works", "#pricing", "#faq"].map((href, i) => {
                const labels = ["Features", "How it Works", "Pricing", "FAQ"];
                return (
                  <button
                    key={href}
                    onClick={() => handleNavClick(href)}
                    className="w-full text-left px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors min-h-[44px]"
                  >
                    {labels[i]}
                  </button>
                );
              })}
              <div className="flex flex-col gap-2 pt-3 pb-1 border-t border-border/40 mt-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="justify-start">Sign In</Button>
                <Button size="sm" onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90">Get Started Free</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
            aria-hidden="true"
          />

          {/* Gradient orbs */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative container mx-auto px-6 text-center py-24">
            {/* Announcement badge */}
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); handleNavClick("#features"); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary hover:bg-primary/15 transition-colors mb-8 group"
              aria-label="Announcement: Now with AI-powered fraud detection - click to learn more"
            >
              <span className="text-primary" aria-hidden="true">✦</span>
              Now with AI-powered fraud detection
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </a>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              Attendance tracking,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                reimagined for modern schools
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Secure QR-based attendance with real-time dashboards, multi-layer fraud prevention, and instant parent notifications — built for the way schools actually work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-base h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
                aria-label="Start using ATTENDO for free"
              >
                Start for free <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 px-8 border-border/60 hover:bg-white/5 gap-2"
                aria-label="Watch product demo video"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 mb-16" aria-label="Social proof: trusted by 500 plus institutions">
              <div className="flex -space-x-2" aria-hidden="true">
                {["SC", "JO", "PS", "RK", "MN"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][i] }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">500+ institutions</span>
              </p>
            </div>

            {/* Hero visual / mockup */}
            <div className="relative mx-auto max-w-3xl">
              <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-2xl shadow-black/20">
                {/* Mockup header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold">Live Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Overall Attendance", value: "87%", sub: "+2.1% this week", color: "text-green-400" },
                    { label: "Active Sessions", value: "12", sub: "3 teachers online", color: "text-indigo-400" },
                    { label: "Students Present", value: "248", sub: "of 284 enrolled", color: "text-purple-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-background/50 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
                      <div className="text-xs text-muted-foreground/60 mt-1">{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Mini chart visual */}
                <div className="flex items-end gap-1 h-12" aria-hidden="true">
                  {[60, 75, 70, 85, 80, 90, 87].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background: i === 6
                          ? "hsl(var(--primary))"
                          : "hsl(var(--primary) / 0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Floating stat badges */}
              <div className="absolute -top-4 -right-4 bg-card border border-border/60 rounded-xl px-3 py-2 shadow-lg text-xs font-medium flex items-center gap-2 animate-float" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                +47 Present today
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-border/60 rounded-xl px-3 py-2 shadow-lg text-xs font-medium flex items-center gap-2 animate-float" style={{ animationDelay: "1.5s" }} aria-hidden="true">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                98.2% attendance rate
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section
          ref={statsRef}
          className="py-16 border-y border-border/40"
          aria-label="Key statistics"
        >
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: `${count1.toLocaleString()}+`, label: "Students Enrolled", icon: Users },
                { value: `${count2}+`, label: "Institutions", icon: Globe },
                { value: "99.9%", label: "Uptime", icon: Zap },
                { value: "<3s", label: "Mark Time", icon: Smartphone },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24" aria-labelledby="features-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-4xl font-bold mb-4 tracking-tight">
                Everything you need
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
                From QR generation to parent notifications — ATTENDO handles every touchpoint with enterprise-grade reliability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
                <div
                  key={title}
                  className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`} aria-hidden="true">
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-muted/20" aria-labelledby="how-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 id="how-heading" className="text-4xl font-bold mb-4 tracking-tight">
                3 steps to smarter attendance
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Set up in minutes. No hardware, no complicated integrations. Just open a browser and you're live.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector lines */}
              <div className="hidden md:block absolute top-12 left-[calc(33.33%+24px)] right-[calc(33.33%+24px)] h-px border-t-2 border-dashed border-border/60" aria-hidden="true" />

              {STEPS.map(({ number, title, description, icon: Icon }) => (
                <div key={number} className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg" aria-hidden="true">
                      {number.replace("0", "")}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24" aria-labelledby="testimonials-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-4xl font-bold mb-4 tracking-tight">
                Loved by educators
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Hear from teachers, administrators, and parents who've transformed how they track attendance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(({ quote, name, role, avatar, color }) => (
                <figure
                  key={name}
                  className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-4" aria-label="5 star rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed mb-6 text-foreground/90">
                    "{quote}"
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`} aria-hidden="true">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-muted/20" aria-labelledby="pricing-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 id="pricing-heading" className="text-4xl font-bold mb-4 tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Start free, scale as you grow. No surprise fees, no long-term contracts.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING.map(({ name, price, period, description, features, cta, popular }) => (
                <div
                  key={name}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    popular
                      ? "bg-primary/5 border-primary/40 shadow-xl shadow-primary/10"
                      : "bg-card/50 border-border/60"
                  }`}
                >
                  {popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">{name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{price}</span>
                      {period && <span className="text-muted-foreground text-sm">{period}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1" aria-label={`${name} plan features`}>
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => navigate("/auth")}
                    className={`w-full ${
                      popular ? "bg-primary hover:bg-primary/90" : "border-border/60 hover:bg-white/5"
                    }`}
                    variant={popular ? "default" : "outline"}
                    aria-label={`${cta} for ${name} plan`}
                  >
                    {cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24" aria-labelledby="faq-heading">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-16">
              <h2 id="faq-heading" className="text-4xl font-bold mb-4 tracking-tight">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Everything you need to know about ATTENDO. Can't find what you're looking for? Contact us.
              </p>
            </div>

            <div className="space-y-3" role="list">
              {FAQS.map(({ q, a }, i) => (
                <div
                  key={i}
                  className="border border-border/60 rounded-xl overflow-hidden"
                  role="listitem"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-muted/30 transition-colors min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                  >
                    {q}
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {openFaq === i && (
                    <div
                      id={`faq-answer-${i}`}
                      role="region"
                      aria-labelledby={`faq-question-${i}`}
                      className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4"
                    >
                      {a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24" aria-labelledby="cta-heading">
          <div className="container mx-auto px-6">
            <div className="relative bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/10 border border-primary/20 rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" aria-hidden="true" />
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
              <div className="relative">
                <h2 id="cta-heading" className="text-4xl font-bold mb-4 tracking-tight">
                  Ready to modernize attendance?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                  Join hundreds of institutions using ATTENDO. Set up in under 10 minutes — results from day one.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="text-base h-12 px-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
                  aria-label="Create your free ATTENDO account"
                >
                  Create Your Free Account <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12" role="contentinfo">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center" aria-hidden="true">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  ATTENDO
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Secure QR-based attendance management for modern educational institutions.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Twitter, label: "Twitter" },
                  { icon: Github, label: "GitHub" },
                  { icon: Linkedin, label: "LinkedIn" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-white/5 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    aria-label={`Follow ATTENDO on ${label}`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Changelog"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Support"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 ATTENDO. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Secure Attendance Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
