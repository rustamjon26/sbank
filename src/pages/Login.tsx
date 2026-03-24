import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Shield,
  QrCode,
  Activity,
  ScanSearch,
} from "lucide-react";

const highlights = [
  {
    icon: QrCode,
    title: "QR-based passport",
    description:
      "Open any asset record instantly with audit history and current owner information.",
  },
  {
    icon: Activity,
    title: "Risk intelligence",
    description:
      "Highlight aging devices, repair-prone assets, and suspicious lifecycle anomalies.",
  },
  {
    icon: ScanSearch,
    title: "Fast inventory flow",
    description:
      "Track assignment, returns, verification, and investigation from one secure workspace.",
  },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password)
      return toast.error("Please enter username and password");
    setLoading(true);
    const { error } = await signInWithUsername(username, password);
    setLoading(false);
    if (error) toast.error(`Login failed: ${error.message}`);
    else {
      toast.success("Login successful");
      navigate(from, { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password)
      return toast.error("Please enter username and password");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await signUpWithUsername(username, password);
    setLoading(false);
    if (error) toast.error(`Registration failed: ${error.message}`);
    else {
      toast.success("Registration successful! Logging in...");
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.32),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.22),transparent_26%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-white hover:bg-white/10">
              Banking asset operations platform
            </Badge>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-cyan-200" />
              </div>
              <div>
                <div className="text-xl font-semibold">SmartAsset AI</div>
                <div className="text-sm text-white/65">
                  Lifecycle, audit, and risk monitoring for bank office assets
                </div>
              </div>
            </div>
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Ship a real hackathon MVP with an enterprise-grade look from day
                one.
              </h1>
              <p className="text-base leading-7 text-white/70 sm:text-lg">
                Manage laptops, printers, terminals, routers, and branch
                equipment with one modern workspace for registration,
                assignment, QR tracking, audit history, and risk-based
                monitoring.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">
                  <item.icon className="h-5 w-5 text-cyan-200" />
                </div>
                <div className="text-sm font-semibold">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <Shield className="h-4 w-4 text-emerald-300" />
              Secure auth • Immutable audit trail • Responsive dashboard •
              Supabase-powered
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <Card className="glass-card mx-auto w-full max-w-md rounded-[28px] border-white/20 bg-white/95 text-slate-900 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.6)]">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary)))] text-white shadow-lg shadow-primary/30">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl font-semibold">
                  Welcome back
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-slate-500">
                  Sign in to manage assets, audits, and branch operations.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  <TabsTrigger value="login" className="rounded-xl">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-xl">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="admin.user"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="h-11 rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="h-11 rounded-2xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-11 w-full rounded-2xl"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Enter workspace"}{" "}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="employee_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="h-11 rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Choose a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="h-11 rounded-2xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-11 w-full rounded-2xl"
                      disabled={loading}
                    >
                      {loading
                        ? "Creating account..."
                        : "Create workspace access"}{" "}
                      {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    <p className="text-center text-xs text-slate-500">
                      <Shield className="mr-1 inline h-3 w-3" />
                      First registered account becomes admin automatically
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
