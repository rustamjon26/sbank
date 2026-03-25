import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/common/RoleBadge";
import {
  getDashboardOverview,
  getEmployeeByEmail,
  getAssetsForEmployee,
} from "@/db/api";
import type { DashboardStats, AssetWithOwner } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RiskBadge, HealthBadge } from "@/components/assets/HealthRiskBadge";
import {
  Package,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
  Activity,
  Building2,
  Eye,
  Sparkles,
  Wrench,
  Search,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "@/components/assets/StatusBadge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  REGISTERED: "hsl(var(--chart-1))",
  ASSIGNED: "hsl(var(--chart-2))",
  IN_REPAIR: "hsl(var(--chart-4))",
  LOST: "hsl(var(--chart-5))",
  WRITTEN_OFF: "hsl(var(--muted-foreground))",
};
const CATEGORY_COLORS = {
  IT: "hsl(var(--chart-1))",
  OFFICE: "hsl(var(--chart-2))",
  SECURITY: "hsl(var(--chart-3))",
  NETWORK: "hsl(var(--chart-4))",
  OTHER: "hsl(var(--chart-5))",
};
const formatOwner = (asset: AssetWithOwner) =>
  asset.owner
    ? `${asset.owner.first_name} ${asset.owner.last_name}`
    : "Unassigned";

type BranchRow = {
  branch: string;
  totalAssets: number;
  highRiskAssets: number;
  agingAssets: number;
  lostAssets: number;
  avgHealthScore: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agingAssets, setAgingAssets] = useState<AssetWithOwner[]>([]);
  const [riskyAssets, setRiskyAssets] = useState<AssetWithOwner[]>([]);
  const [suspiciousAssets, setSuspiciousAssets] = useState<AssetWithOwner[]>(
    [],
  );
  const [problematicAssets, setProblematicAssets] = useState<AssetWithOwner[]>(
    [],
  );
  const [branchComparison, setBranchComparison] = useState<BranchRow[]>([]);
  const [healthScores, setHealthScores] = useState<Record<string, number>>({});
  const [riskScores, setRiskScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const canManage =
    profile?.role === "admin" || profile?.role === "asset_manager";

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile?.role]);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardOverview();

      const isEmployee = profile?.role === "employee";

      if (isEmployee && profile?.email) {
        // Resolve employee record via email
        const employee = await getEmployeeByEmail(profile.email);

        if (employee) {
          // Fetch assets specifically assigned to this employee
          const myAssets = await getAssetsForEmployee(employee.id);

          // Filters for specific sub-lists based on intelligence criteria
          // Note: we still need the full overview data for health/risk scores mapping
          const myRisky = myAssets.filter((a) => {
            const rs = data.riskScores[a.id] || 0;
            return rs >= 70; // High risk threshold
          });

          const myAging = myAssets.filter((a) => {
            const hs = data.healthScores[a.id] || 0;
            return hs < 40; // Aging/Critical health threshold
          });

          setStats({
            ...data.stats,
            total_assets: myAssets.length,
            risky_assets: myRisky.length,
            aging_assets: myAging.length,
            suspicious_assets: 0, // Employees don't see audit suspicious flags usually
            by_status: {
              ...data.stats.by_status,
              ASSIGNED: myAssets.filter(
                (a: AssetWithOwner) => a.status === "ASSIGNED",
              ).length,
              IN_REPAIR: myAssets.filter(
                (a: AssetWithOwner) => a.status === "IN_REPAIR",
              ).length,
            },
          });
          setAgingAssets(myAging);
          setRiskyAssets(myRisky);
          setSuspiciousAssets([]); // Clear for employees
          setProblematicAssets(
            myAssets.filter((a) => (data.healthScores[a.id] || 0) < 60),
          );
        } else {
          // Employee record not found, search by email failed
          setStats({
            ...data.stats,
            total_assets: 0,
            risky_assets: 0,
            aging_assets: 0,
            suspicious_assets: 0,
            by_status: {
              ...data.stats.by_status,
              ASSIGNED: 0,
              REGISTERED: 0,
              IN_REPAIR: 0,
              LOST: 0,
              WRITTEN_OFF: 0,
            },
          });
          setAgingAssets([]);
          setRiskyAssets([]);
          setSuspiciousAssets([]);
          setProblematicAssets([]);
        }
      } else {
        setStats(data.stats);
        setAgingAssets(data.agingAssets);
        setRiskyAssets(data.riskyAssets);
        setSuspiciousAssets(data.suspiciousAssets);
        setProblematicAssets(data.problematicAssets);
      }

      setBranchComparison(data.branchComparison);
      setHealthScores(data.healthScores);
      setRiskScores(data.riskScores);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = useMemo(
    () =>
      stats
        ? Object.entries(stats.by_status).map(([name, value]) => ({
            name,
            value,
          }))
        : [],
    [stats],
  );
  const categoryData = useMemo(
    () =>
      stats
        ? Object.entries(stats.by_category).map(([name, value]) => ({
            name,
            value,
          }))
        : [],
    [stats],
  );

  if (loading) {
    return (
      <div className="page-section">
        <Skeleton className="h-40 rounded-3xl bg-muted/70" />
        <div className="data-grid">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-muted/70" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-5">
          <Skeleton className="h-[360px] rounded-3xl bg-muted/70 xl:col-span-3" />
          <Skeleton className="h-[360px] rounded-3xl bg-muted/70 xl:col-span-2" />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-3xl bg-muted/70" />
          ))}
        </div>
      </div>
    );
  }
  if (!stats) return null;

  const metricCards = [
    {
      title: canManage ? "Total assets" : "My assets",
      value: stats.total_assets,
      description: canManage
        ? "All registered bank equipment"
        : "Equipment currently assigned to you",
      icon: Package,
    },
    {
      title: canManage ? "Assigned assets" : "Active health",
      value: stats.by_status.ASSIGNED,
      description: canManage
        ? "Currently held by employees"
        : "Status of your primary workstation",
      icon: TrendingUp,
    },
    {
      title: canManage ? "Aging alerts" : "Replacement status",
      value: stats.aging_assets,
      description: canManage
        ? "Devices near replacement window"
        : "Checking if your hardware is up-to-date",
      icon: Clock,
    },
    {
      title: canManage ? "Audit flags" : "Compliance",
      value: stats.suspicious_assets,
      description: canManage
        ? "Assets requiring ownership review"
        : "Your current asset audit status",
      icon: Shield,
    },
  ];

  return (
    <div className="page-section">
      {/* Hero */}
      <section className="hero-panel">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Operations overview
              </Badge>
              {profile && <RoleBadge role={profile.role as any} />}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Welcome back,{" "}
              <span className="text-primary font-bold">
                {profile?.first_name || profile?.username || "Commander"}
              </span>
            </h1>
            <p className="section-subtitle mt-4 max-w-2xl text-foreground/70 sm:text-lg">
              {canManage
                ? "Monitor asset health, track suspicious movements, and manage banking equipment across all branches in real-time."
                : "View your assigned equipment, track health status, and report issues with your workstation assets."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-2xl border border-primary/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:bg-slate-950/50">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Coverage
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {stats.total_assets}
              </div>
              <div className="text-sm text-muted-foreground">
                tracked assets
              </div>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:bg-slate-950/50">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Risk
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {stats.risky_assets}
              </div>
              <div className="text-sm text-muted-foreground">
                priority cases
              </div>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:bg-slate-950/50">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Audit
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {stats.suspicious_assets}
              </div>
              <div className="text-sm text-muted-foreground">needs review</div>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="data-grid">
        {metricCards.map((item) => (
          <Card key={item.title} className="metric-card rounded-3xl">
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Charts (Admin/Manager only) */}
      {canManage && (
        <section className="grid gap-6 xl:grid-cols-5">
          <Card className="glass-card rounded-3xl xl:col-span-3">
            <CardHeader>
              <CardTitle>Status distribution</CardTitle>
              <CardDescription>
                See how assets are spread across their lifecycle states.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          STATUS_COLORS[
                            entry.name as keyof typeof STATUS_COLORS
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-3xl xl:col-span-2">
            <CardHeader>
              <CardTitle>Category mix</CardTitle>
              <CardDescription>
                Understand which asset groups dominate your inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CATEGORY_COLORS[
                            entry.name as keyof typeof CATEGORY_COLORS
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Priority Lists: Risky, Aging, Suspicious for Admin | My Assets for Employee */}
      <section className="grid gap-6 xl:grid-cols-3">
        {!canManage ? (
          /* Employee View: My Primary Assets */
          <Card className="glass-card rounded-3xl xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  My Assigned Assets
                </CardTitle>
                <CardDescription>
                  Equipment currently in your possession.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-xl">
                <Link to="/assets">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {problematicAssets.length === 0 &&
                riskyAssets.length === 0 &&
                agingAssets.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">
                      All equipment healthy
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No urgent issues reported with your workstation.
                    </p>
                  </div>
                )}
              <div className="grid gap-4 sm:grid-cols-2">
                {[...riskyAssets, ...agingAssets, ...problematicAssets]
                  .slice(0, 4)
                  .map((asset) => (
                    <Link
                      key={asset.id}
                      to={`/assets/${asset.id}`}
                      className="flex flex-col rounded-2xl border border-border/70 bg-background/50 p-5 transition-all hover:border-primary/30 hover:bg-primary/5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {asset.name}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {asset.serial_number}
                          </div>
                        </div>
                        <StatusBadge status={asset.status} />
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex gap-2">
                          <HealthBadge
                            score={healthScores[asset.id] || 100}
                            level={
                              healthScores[asset.id] >= 80
                                ? "Healthy"
                                : "Warning"
                            }
                            size="sm"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg px-2 text-xs"
                        >
                          Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Admin View: Top Risky Assets */
          <Card className="glass-card rounded-3xl border-rose-200/50 dark:border-rose-900/30">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  Top Risky Assets
                </CardTitle>
                <CardDescription>
                  Devices with elevated repair, aging, or anomaly signals.
                </CardDescription>
              </div>
              <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/10">
                {riskyAssets.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskyAssets.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="All clear"
                  description="No high-risk assets right now."
                />
              ) : (
                riskyAssets.slice(0, 5).map((asset) => (
                  <Link
                    key={asset.id}
                    to={`/assets/${asset.id}`}
                    className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-sm dark:hover:bg-rose-950/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{asset.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {asset.serial_number}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <RiskBadge
                            score={riskScores[asset.id] ?? 0}
                            size="sm"
                          />
                          <HealthBadge
                            score={healthScores[asset.id] ?? 0}
                            level={
                              healthScores[asset.id] >= 80
                                ? "Healthy"
                                : healthScores[asset.id] >= 50
                                  ? "Warning"
                                  : "Critical"
                            }
                            size="sm"
                          />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {formatOwner(asset)} • {asset.branch}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-xl"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Aging Assets (Visible to both but filtered) */}
        {!canManage && (
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                Quick Support
              </CardTitle>
              <CardDescription>Need help with your equipment?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
                <h4 className="font-medium text-sm">Report a Hardware Issue</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Get technical support for your assigned laptop or peripheral.
                </p>
                <Button
                  className="mt-3 w-full rounded-xl"
                  variant="outline"
                  asChild
                >
                  <Link to="/assets">Report Issue</Link>
                </Button>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
                <h4 className="font-medium text-sm">Replacement Request</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Is your device slowing down or near end-of-life?
                </p>
                <Button
                  className="mt-3 w-full rounded-xl"
                  variant="outline"
                  asChild
                >
                  <Link to="/assets">Check Eligibility</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {canManage && (
          <Card className="glass-card rounded-3xl border-amber-200/50 dark:border-amber-900/30">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Aging Assets
                </CardTitle>
                <CardDescription>
                  Assets nearing end-of-life that may need replacement.
                </CardDescription>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">
                {agingAssets.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {agingAssets.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No aging assets"
                  description="All assets are within their expected lifecycle."
                />
              ) : (
                agingAssets.slice(0, 5).map((asset) => {
                  const hs = healthScores[asset.id] ?? 100;
                  const shouldReplace =
                    hs < 40 || (riskScores[asset.id] ?? 0) > 75;
                  return (
                    <Link
                      key={asset.id}
                      to={`/assets/${asset.id}`}
                      className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition-all hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm dark:hover:bg-amber-950/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {asset.name}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {asset.branch} • {asset.department}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <HealthBadge
                              score={hs}
                              level={
                                hs >= 80
                                  ? "Healthy"
                                  : hs >= 50
                                    ? "Warning"
                                    : "Critical"
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Review
                        </Button>
                        {shouldReplace ? (
                          <Button
                            size="sm"
                            className="rounded-xl bg-rose-600 text-xs text-white hover:bg-rose-700"
                          >
                            🔄 Replace Candidate
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-xl text-xs"
                          >
                            <Wrench className="mr-1 h-3 w-3" />
                            Monitor
                          </Button>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* Audit Watchlist (Admin/Manager only) */}
        {canManage && (
          <Card className="glass-card rounded-3xl border-sky-200/50 dark:border-sky-900/30">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-sky-500" />
                  Audit Watchlist
                </CardTitle>
                <CardDescription>
                  Suspicious lifecycle records needing admin review.
                </CardDescription>
              </div>
              <Badge className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/10">
                {suspiciousAssets.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {suspiciousAssets.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No anomalies"
                  description="No suspicious patterns detected."
                />
              ) : (
                suspiciousAssets.slice(0, 4).map((asset) => (
                  <Link
                    key={asset.id}
                    to={`/assets/${asset.id}`}
                    className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-sky-300 hover:bg-sky-50/50 dark:hover:bg-sky-950/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {asset.branch} • {asset.category}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {formatOwner(asset)}
                        </div>
                      </div>
                      <Badge className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/10">
                        Review
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Hackathon-Winning: Problematic Assets + Branch Risk (Admin/Manager only) */}
      {canManage && (
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Problematic Asset Insights */}
          <Card className="glass-card rounded-3xl">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Problematic Asset Insights
                </CardTitle>
                <CardDescription>
                  Assets with repeated repairs, excessive owner transfers, or
                  audit anomalies.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {problematicAssets.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No problematic assets"
                  description="All assets are operating normally."
                />
              ) : (
                problematicAssets.slice(0, 5).map((asset) => (
                  <Link
                    key={asset.id}
                    to={`/assets/${asset.id}`}
                    className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{asset.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {asset.branch} • {asset.serial_number}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <RiskBadge
                            score={riskScores[asset.id] ?? 0}
                            size="sm"
                          />
                          <HealthBadge
                            score={healthScores[asset.id] ?? 0}
                            level={
                              healthScores[asset.id] >= 80
                                ? "Healthy"
                                : healthScores[asset.id] >= 50
                                  ? "Warning"
                                  : "Critical"
                            }
                            size="sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl shrink-0"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Inspect
                      </Button>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Branch Risk Comparison */}
          <Card className="glass-card rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" />
                Branch Risk Comparison
              </CardTitle>
              <CardDescription>
                Aggregated risk metrics per branch office.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {branchComparison.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No branch data"
                  description="Add assets to see branch comparisons."
                />
              ) : (
                <div className="space-y-3">
                  {branchComparison.map((b) => {
                    const riskRatio =
                      b.totalAssets > 0
                        ? (b.highRiskAssets / b.totalAssets) * 100
                        : 0;
                    return (
                      <div
                        key={b.branch}
                        className="rounded-2xl border border-border/70 bg-background/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">{b.branch}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {b.totalAssets} assets • Avg health:{" "}
                              {b.avgHealthScore}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {b.highRiskAssets > 0 && (
                              <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/10">
                                {b.highRiskAssets} risky
                              </Badge>
                            )}
                            {b.lostAssets > 0 && (
                              <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">
                                {b.lostAssets} lost
                              </Badge>
                            )}
                            {b.highRiskAssets === 0 && b.lostAssets === 0 && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                                Healthy
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Risk bar */}
                        <div className="mt-3 h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${riskRatio > 30 ? "bg-rose-500" : riskRatio > 10 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.max(riskRatio, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Demo-ready CTA */}
      <section className="flex flex-col gap-3 rounded-3xl border border-primary/10 bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),transparent_45%,hsl(var(--secondary)/0.08))] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Activity className="h-4 w-4" />
            Demo-ready workflow
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Show the full lifecycle in under 2 minutes.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create an asset, assign it to an employee, verify it, then open the
            detail page to show QR, intelligence scores, and full audit history.
          </p>
        </div>
        <Button asChild className="rounded-2xl">
          <Link to="/assets">
            Open assets workspace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
