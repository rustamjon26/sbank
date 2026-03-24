import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  QrCode,
  FileSearch,
  LineChart,
  PlayCircle,
  AlertCircle,
  EyeOff,
  FileQuestion,
  Users,
  FileWarning,
  Server,
  RefreshCcw,
  ClipboardList,
  Laptop,
  Network,
  Search,
  BrainCircuit,
  Sparkles,
  TrendingDown,
  Target,
  Zap,
  BarChart3,
  PlusCircle,
  UserCheck,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Quote,
  Star,
  Mail,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ───────────────────────── HEADER ───────────────────────── */
function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "AI Insights", href: "#ai-insights" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      document
        .getElementById(href.substring(1))
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-3" : "bg-transparent py-5"}`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-cyan-600 transition-colors">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span
            className={`text-xl font-bold tracking-tight transition-colors ${isScrolled ? "text-slate-900" : "text-white"}`}
          >
            AssetFlow <span className="text-cyan-600">Bank</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => scrollTo(e, l.href)}
              className={`text-sm font-medium hover:text-cyan-600 transition-colors ${isScrolled ? "text-slate-600" : "text-slate-200"}`}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className={`text-sm font-medium hover:text-cyan-600 transition-colors ${isScrolled ? "text-slate-600" : "text-white"}`}
          >
            Sign In
          </Link>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full px-6 font-medium border-0"
            onClick={() => navigate("/login")}
          >
            Request Demo <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X
              className={`h-6 w-6 ${isScrolled ? "text-slate-900" : "text-white"}`}
            />
          ) : (
            <Menu
              className={`h-6 w-6 ${isScrolled ? "text-slate-900" : "text-white"}`}
            />
          )}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-6 md:hidden flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => scrollTo(e, l.href)}
              className="text-lg font-medium text-slate-800 py-2 border-b border-slate-100"
            >
              {l.label}
            </a>
          ))}
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg rounded-xl mt-4"
            onClick={() => navigate("/login")}
          >
            Request Demo
          </Button>
        </div>
      )}
    </header>
  );
}

/* ───────────────────────── HERO ───────────────────────── */
function HeroSection() {
  const navigate = useNavigate();
  const trustBadges = [
    { icon: FileSearch, text: "Full Lifecycle Tracking" },
    { icon: QrCode, text: "QR-Based Auth" },
    { icon: ShieldCheck, text: "Audit & Compliance Ready" },
    { icon: LineChart, text: "AI Risk Monitoring" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[130px] translate-y-1/2 -translate-x-1/3" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 blur-[2px]" />
              Enterprise Asset Governance
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Total Visibility for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Banking Assets
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
              The unified platform for financial institutions to track, audit,
              and secure office and IT assets across every branch, department,
              and employee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full h-14 px-8 text-base font-medium shadow-lg shadow-cyan-600/20"
              >
                Request Demo <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white rounded-full h-14 px-8 text-base font-medium"
              >
                <PlayCircle className="mr-2 h-5 w-5 text-cyan-400" /> See How It
                Works
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trustBadges.map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <b.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative lg:h-[600px] items-center justify-center hidden lg:flex">
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden z-20 flex flex-col">
              <div className="h-10 bg-slate-950 px-4 flex items-center gap-2 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                </div>
                <div className="mx-auto bg-slate-900 rounded-md px-4 py-1 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">
                    assetflow.bank/dashboard
                  </span>
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col py-4 px-2 gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600/20 text-cyan-500 flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600">
                    <FileSearch className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 p-6 bg-[#04091A]">
                  <div className="flex justify-between mb-6">
                    <div className="h-6 w-32 bg-slate-800 rounded-md" />
                    <div className="h-6 w-24 bg-cyan-900/40 border border-cyan-800 rounded-md" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="h-3 w-16 bg-slate-800 rounded" />
                        <div
                          className={`h-6 w-12 ${n === 3 ? "bg-cyan-600" : "bg-slate-700"} rounded`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 h-32 bg-slate-900/50 border border-slate-800 rounded-xl" />
                </div>
              </div>
            </div>
            {/* Floating card top-right */}
            <div className="absolute -right-12 -top-8 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl z-30 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Status Update</div>
                  <div className="text-sm font-semibold text-white">
                    Security Audit Passed
                  </div>
                </div>
              </div>
            </div>
            {/* Floating card bottom-left */}
            <div className="absolute -left-12 bottom-12 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl z-30 flex items-center gap-3 animate-float-delayed">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">New Asset Assigned</div>
                <div className="text-sm font-semibold text-white">
                  ThinkPad X1 to QA Dept
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PROBLEM ───────────────────────── */
function ProblemSection() {
  const problems = [
    {
      icon: EyeOff,
      title: "Unclear Ownership",
      description:
        "Laptops and devices move between employees without proper tracking, leading to confused accountability.",
    },
    {
      icon: Users,
      title: "Branch-Level Blind Spots",
      description:
        "Headquarters lacks visibility into hardware assigned to distant branches, leading to misallocation.",
    },
    {
      icon: AlertCircle,
      title: "Operational Risk",
      description:
        "Lost or broken assets cause unexpected downtime, compliance issues, and unbudgeted replacement costs.",
    },
    {
      icon: FileWarning,
      title: "Manual Inventory Audits",
      description:
        "Periodic audits involve slow, error-prone spreadsheet updates rather than real-time digital verification.",
    },
    {
      icon: FileQuestion,
      title: "Accountability Gaps",
      description:
        "Incomplete asset history makes it impossible to know who authorized changes in asset status or location.",
    },
  ];
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              The Financial <br />
              <span className="text-cyan-600">Black Hole</span> <br />
              of IT Assets
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Banks manage thousands of devices. Without a unified ledger of
              where assets are and who holds them, operational risks multiply
              and audit readiness drops.
            </p>
          </div>
          <div className="w-full md:w-2/3">
            <div className="grid sm:grid-cols-2 gap-6">
              {problems.map((p, i) => (
                <div
                  key={i}
                  className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${i === 4 ? "sm:col-span-2 sm:max-w-md sm:mx-auto" : ""}`}
                >
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-4 border border-rose-100">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SOLUTION ───────────────────────── */
function SolutionSection() {
  const features = [
    {
      icon: Server,
      title: "Centralized Ledger",
      description:
        "A single source of truth for all IT and office hardware across the entire institution.",
    },
    {
      icon: Users,
      title: "Ownership Tracking",
      description:
        "Precise assignment of assets to specific employees, departments, or geographical branches.",
    },
    {
      icon: RefreshCcw,
      title: "Lifecycle Control",
      description:
        "Monitor status transitions from 'Registered' to 'In Repair' to eventual 'Write-Off'.",
    },
    {
      icon: QrCode,
      title: "QR Instant Lookup",
      description:
        "Scan any physical asset with a mobile device to instantly reveal its ownership and audit history.",
    },
    {
      icon: ClipboardList,
      title: "Immutable Audit Trail",
      description:
        "Every reassignment and status change is securely logged, ensuring 100% compliance readiness.",
    },
    {
      icon: LineChart,
      title: "Smart Monitoring",
      description:
        "Analytics that automatically highlight aging equipment and anomalous repair frequencies.",
    },
  ];
  return (
    <section className="py-24 bg-slate-900 text-white relative">
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            The Ultimate Infrastructure <br className="hidden md:block" /> for
            Physical Asset Governance
          </h2>
          <p className="text-lg text-slate-400">
            AssetFlow Bank replaces spreadsheets with a real-time,
            compliant-ready platform built explicitly to handle the scale and
            security required by modern financial institutions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm p-8 rounded-2xl hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 mb-6 border border-slate-700 group-hover:bg-cyan-900/40 group-hover:border-cyan-800 transition-colors">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {f.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CORE FEATURES ───────────────────────── */
function CoreFeaturesSection() {
  const featureList = [
    {
      title: "Extensive Asset Registration",
      description:
        "Store high-fidelity records including serial numbers, hardware categories, purchase dates, warranties, and photographic evidence for every asset.",
    },
    {
      title: "Hierarchical Ownership Mapping",
      description:
        "Directly assign assets to specific bank employees, bind them to entire departments, or anchor them to regional branches.",
    },
    {
      title: "Strict Business Rule Transitions",
      description:
        "Enforce logical progression. Assets cannot be 'Written Off' without being marked as 'Lost' or 'In Repair' first, ensuring auditable state management.",
    },
    {
      title: "Advanced Search & Discovery",
      description:
        "Comb through thousands of records instantly using granular filters for branch, department, category, type, and current status.",
    },
    {
      title: "Enterprise Architecture",
      description:
        "Built on scalable, secure, and compliant cloud infrastructure, protecting sensitive operational data behind robust access controls.",
    },
  ];
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Engineered for{" "}
            <span className="text-cyan-600">Enterprise Control</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Deep configurations that adapt to your internal workflows while
            enforcing best-practice lifecycle standards.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative h-[500px] w-full bg-slate-50 rounded-3xl border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden">
            <div className="relative z-10 w-full max-w-md">
              <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-6 relative">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      MacBook Pro 16"
                    </h4>
                    <p className="text-sm text-slate-500">SN: C02X1234F3M4</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      ASSIGNED
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Main Headquarters
                      </p>
                      <p className="text-xs text-slate-500">
                        Corporate Banking Dept
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Network className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Jane Smith
                      </p>
                      <p className="text-xs text-slate-500">
                        VP, Commercial Lending
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 bg-slate-900 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold">
                    Audit Log Updated
                  </span>
                </div>
              </div>
              <div className="absolute top-10 -right-10 bg-white p-3 rounded-lg shadow-md border border-slate-100 flex items-center gap-3">
                <Search className="w-4 h-4 text-cyan-600" />
                <div className="w-20 h-2 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            {featureList.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── AI INSIGHTS ───────────────────────── */
function AIInsightsSection() {
  const insights = [
    {
      icon: TrendingDown,
      title: "Failure Risk Prediction",
      description:
        "AI analyzes repair history and hardware age to predict which assets are most likely to fail in the next quarter.",
    },
    {
      icon: Target,
      title: "Smart Audit Prioritization",
      description:
        "Automatically surface high-value or high-risk assets that haven't been scanned in 90+ days for immediate audit.",
    },
    {
      icon: Zap,
      title: "Anomaly Detection",
      description:
        "Detect unusual asset patterns such as frequent reassignments or excessive repair requests for specific hardware models.",
    },
    {
      icon: BarChart3,
      title: "Operational Forecasting",
      description:
        "Get data-driven recommendations for hardware procurement based on historical lifecycle data and branch needs.",
    },
  ];
  return (
    <section
      id="ai-insights"
      className="py-24 bg-[#020617] relative overflow-hidden"
    >
      <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="relative p-1 rounded-3xl bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent border border-blue-500/10 shadow-2xl">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-8 overflow-hidden min-h-[400px] flex flex-col justify-center relative">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-20 flex items-center justify-center">
                  <BrainCircuit className="w-full h-full text-cyan-400 animate-pulse" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" /> Advanced Feature
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    Intelligence that <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      Predicts Risk
                    </span>
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                    Move from reactive management to proactive governance. Our
                    AI engine identifies patterns human auditors miss, surfacing
                    risks before they impact your operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 grid sm:grid-cols-2 gap-4">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/40 transition-all hover:bg-slate-900/80 group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-slate-800 border border-slate-700 group-hover:bg-slate-800 transition-colors">
                  <ins.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {ins.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── HOW IT WORKS ───────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      icon: PlusCircle,
      title: "Register Assets",
      description:
        "Quickly enter asset details, serial numbers, and photos. Our system generates unique identifiers for every piece of hardware.",
    },
    {
      icon: UserCheck,
      title: "Assign Responsibility",
      description:
        "Bind assets to specific employees, branches, or departments. Establish clear accountability from day one.",
    },
    {
      icon: ShieldCheck,
      title: "Monitor & Scan",
      description:
        "Use QR codes for instant physical verification. Track status changes through an immutable audit trail.",
    },
    {
      icon: PieChart,
      title: "Analyze & Audit",
      description:
        "Generate deep reports on branch performance, aging assets, and compliance readiness through automated insights.",
    },
  ];
  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Streamlined Asset <span className="text-cyan-600">Governance</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our 4-step workflow is designed to fit seamlessly into bank
            operations, ensuring no asset is left unmanaged.
          </p>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((s, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-all duration-300 shadow-sm">
                  <s.icon className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-bold border border-cyan-200">
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {s.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── BENEFITS ───────────────────────── */
function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Reduced Asset Loss",
      description:
        "Minimize the financial impact of lost hardware through precise tracking and employee accountability.",
    },
    {
      icon: Users,
      title: "Better Accountability",
      description:
        "Establish a clear line of responsibility for every terminal, laptop, and scanner in the branch.",
    },
    {
      icon: Clock,
      title: "Faster Audit Cycles",
      description:
        "Reduce the time spent on manual inventory checks by up to 70% with QR-based digital verification.",
    },
    {
      icon: Search,
      title: "Operational Transparency",
      description:
        "Instant visibility into asset status and location across all branches from a single dashboard.",
    },
    {
      icon: CheckCircle2,
      title: "Lower Manual Effort",
      description:
        "Automate reporting and alerts, freeing up IT staff to focus on high-value technical initiatives.",
    },
    {
      icon: ShieldCheck,
      title: "Compliance Readiness",
      description:
        "Maintain a perfect audit trail that satisfies internal and external regulatory requirements.",
    },
  ];
  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Why Modern Banks Choose <br className="hidden md:block" />
            <span className="text-cyan-600">AssetFlow Bank</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our platform goes beyond simple inventory management to provide a
            robust framework for institutional asset governance.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mb-6 border border-cyan-100">
                <b.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {b.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── DASHBOARD PREVIEW ───────────────────────── */
function DashboardPreviewSection() {
  return (
    <section className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_60%)]" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Insights That Drive <br className="hidden md:block" />
            <span className="text-cyan-400">Institutional Governance</span>
          </h2>
          <p className="text-lg text-slate-400">
            A comprehensive, high-fidelity view of your entire hardware
            landscape, allowing you to make data-driven decisions at scale.
          </p>
        </div>
        <div className="relative p-2 rounded-[2.5rem] bg-gradient-to-b from-slate-700/50 to-transparent border border-white/5 shadow-2xl">
          <div className="bg-slate-950/80 backdrop-blur-3xl rounded-[2.25rem] p-10">
            <div className="w-full grid lg:grid-cols-4 gap-8">
              {/* Status */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-cyan-400" /> Status
                  Distribution
                </h4>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full border-8 border-cyan-500/20 border-t-cyan-500 animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    78%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ASSIGNED</span>
                    <span className="text-white font-medium">1,240</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">REGISTERED</span>
                    <span className="text-white font-medium">412</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">IN_REPAIR</span>
                    <span className="text-rose-400 font-medium">23</span>
                  </div>
                </div>
              </div>
              {/* Categories */}
              <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" /> Top Asset
                    Categories
                  </h4>
                  <span className="text-[10px] text-cyan-500 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-cyan-500/20">
                    Live Data
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Computing Devices", val: "75%", total: "842" },
                    { label: "Peripheral Hardware", val: "45%", total: "521" },
                    { label: "Branch Tech", val: "25%", total: "318" },
                  ].map((r, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs uppercase tracking-wider">
                        <span className="text-slate-500 font-medium">
                          {r.label}
                        </span>
                        <span className="text-slate-300 font-semibold">
                          {r.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-600 rounded-full"
                          style={{ width: r.val }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Alerts */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Critical
                  Alerts
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        Aging Asset
                      </div>
                      <div className="text-xs font-semibold text-white">
                        ATM Scanner v4 - Main Branch
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        Unassigned
                      </div>
                      <div className="text-xs font-semibold text-white">
                        MacBook Pro - IT Pool #42
                      </div>
                    </div>
                  </div>
                </div>
                <button className="mt-auto text-center py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 rounded-lg hover:bg-cyan-500/5">
                  VIEW ALL RISK ALERTS
                </button>
              </div>
            </div>
            <div className="mt-12 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── TESTIMONIALS ───────────────────────── */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "AssetFlow Bank has completely transformed how we handle hardware across our 45 branches. The QR-based identification alone saved us dozens of hours during our last internal audit.",
      author: "Robert Chen",
      role: "Head of IT Operations",
      bank: "Metropolitan Federal Bank",
    },
    {
      quote:
        "The ability to assign assets directly to departments and see the full lifecycle history has cleared up years of accountability gaps. It's the most professional asset tool I've used.",
      author: "Sarah Jenkins",
      role: "Internal Audit Lead",
      bank: "Global Trust Finance",
    },
    {
      quote:
        "Before AssetFlow, we struggled with 'ghost assets' that were still on the books but nowhere to be found. Now, we have 100% visibility into every terminal and scanner in the branch.",
      author: "Mark Thompson",
      role: "Branch Technology Manager",
      bank: "Commonwealth Union",
    },
  ];
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Trusted by <span className="text-cyan-600">Banking Leaders</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how financial institutions are achieving operational resilience
            with our unified asset governance platform.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-cyan-500 text-cyan-500"
                    />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-cyan-500/20 mb-4" />
                <p className="text-slate-700 leading-relaxed italic mb-8">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-[10px] uppercase font-bold text-cyan-600 tracking-wider mt-0.5">
                    {t.bank}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */
function FAQSection() {
  const faqs = [
    {
      q: "Is this suitable for multi-branch banks?",
      a: "Yes, AssetFlow Bank is built with a hierarchical architecture specifically for institutions with dozens or hundreds of branches, allowing both regional and centralized visibility.",
    },
    {
      q: "Can assets be assigned to both departments and branches?",
      a: "Absolutely. Our flexible ownership model allows you to bind hardware to a physical branch, a specific department within that branch, or an individual employee.",
    },
    {
      q: "Does it support QR-based identification?",
      a: "Yes, the platform automatically generates unique QR codes for every asset, which can be scanned by any smartphone to instantly show ownership and audit details.",
    },
    {
      q: "Is there a full audit history for all actions?",
      a: "Every status change, assignment, and scan is recorded in an immutable ledger, providing a complete 100% auditable history for compliance reviews.",
    },
    {
      q: "Can the platform highlight aging or risky assets?",
      a: "Our AI engine automatically flags assets based on their age, repair frequency, and hardware type, surfacing them in a dedicated 'Risk Registry' for proactive management.",
    },
    {
      q: "Can the platform be adapted to our internal workflows?",
      a: "Yes, we offer business rule validation that can be configured to match your specific asset lifecycle and approval processes.",
    },
  ];
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Frequently Asked <span className="text-cyan-600">Questions</span>
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about implementing AssetFlow at your
            institution.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <button
                className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className="font-bold text-slate-900">{f.q}</span>
                {active === i ? (
                  <ChevronUp className="w-5 h-5 text-cyan-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {active === i && (
                <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */
function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[160px]" />
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-all" />
          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-8">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready for Total <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Asset Visibility?
              </span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              Built for modern banks that need full asset visibility,
              audit-ready records, and structured ownership tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full h-16 px-10 text-lg font-bold shadow-xl shadow-cyan-600/20"
              >
                Request Demo <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-4 sm:mt-0 px-4">
                <Mail className="w-4 h-4 text-cyan-500/60" />{" "}
                contact@assetflow.bank
              </div>
            </div>
            <p className="mt-12 text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">
              Enterprise-Grade Visibility • Audit-Ready Records • Operational
              Resilience
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */
function LandingFooter() {
  const yr = new Date().getFullYear();
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-cyan-600 p-2 rounded-xl">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AssetFlow <span className="text-cyan-500">Bank</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-xs">
              The unified platform for financial institutions to track, audit,
              and secure office and IT assets across every branch and
              department.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all border border-slate-800"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#features"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#ai-insights"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  AI Insights
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Audit Templates
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Branch Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-500 hover:text-cyan-400 text-sm transition-colors"
                >
                  Security PDF
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail className="w-4 h-4 text-cyan-500" />{" "}
                contact@assetflow.bank
              </li>
              <li className="text-slate-500 text-sm leading-relaxed">
                123 Financial District,
                <br />
                Innovation Hub, Suite 402
                <br />
                London, UK
              </li>
              <li>
                <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mb-1">
                    System Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-white">
                      All Systems Operational
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-xs">
            © {yr} AssetFlow Bank. Built for Modern Financial Institutions.
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
            >
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── MAIN LANDING PAGE ───────────────────────── */
const Landing: React.FC = () => {
  return (
    <div className="font-sans text-slate-900 overflow-x-hidden bg-slate-50 selection:bg-cyan-500/30">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float-delayed { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out 1s infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <CoreFeaturesSection />
        <AIInsightsSection />
        <HowItWorksSection />
        <BenefitsSection />
        <DashboardPreviewSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
