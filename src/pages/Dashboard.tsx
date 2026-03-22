import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardOverview } from "@/db/api";
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
import {
  RiskBadge,
  HealthBadge,
  getRiskLevel,
} from "@/components/assets/HealthRiskBadge";
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
} from "lucide-react";
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

  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardOverview();
      setStats(data.stats);
      setAgingAssets(data.agingAssets);
      setRiskyAssets(data.riskyAssets);
      setSuspiciousAssets(data.suspiciousAssets);
      setProblematicAssets(data.problematicAssets);
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
      title: "Total assets",
      value: stats.total_assets,
      description: "All registered branch and office equipment",
      icon: Package,
    },
    {
      title: "Assigned assets",
      value: stats.by_status.ASSIGNED,
      description: "Currently held by employees or active offices",
      icon: TrendingUp,
    },
    {
      title: "Aging alerts",
      value: stats.aging_assets,
      description: "Devices near end-of-life or replacement window",
      icon: Clock,
    },
    {
      title: "Suspicious flags",
      value: stats.suspicious_assets,
      description: "Assets requiring audit or ownership review",
      icon: Shield,
    },
  ];

  return (
    <div className="page-section">
      {/* Hero */}
      <section className="hero-panel">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
              Operations overview
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Keep bank office assets visible, verifiable, and audit-ready.
            </h1>
            <p className="section-subtitle max-w-2xl text-foreground/70">
              Track lifecycle status, identify risky devices, and prioritize
              branch actions with a dashboard designed for fast hackathon demos
              and real-world operations.
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

      {/* Charts */}
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
                        STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]
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

      {/* Priority Lists: Risky, Aging, Suspicious */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Top Risky Assets — STRONGEST BLOCK */}
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
                      asChild
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-xl"
                    >
                      <Link to={`/assets/${asset.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Aging Assets with CTAs */}
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
                  <div
                    key={asset.id}
                    className="rounded-2xl border border-border/70 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{asset.name}</div>
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
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs"
                      >
                        <Link to={`/assets/${asset.id}`}>
                          <Eye className="mr-1 h-3 w-3" />
                          Review
                        </Link>
                      </Button>
                      {shouldReplace ? (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-rose-600 text-xs text-white hover:bg-rose-700"
                        >
                          <Link to={`/assets/${asset.id}`}>
                            🔄 Replace Candidate
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="rounded-xl text-xs"
                        >
                          <Link to={`/assets/${asset.id}`}>
                            <Wrench className="mr-1 h-3 w-3" />
                            Monitor
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Audit Watchlist */}
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
      </section>

      {/* Hackathon-Winning: Problematic Assets + Branch Risk */}
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
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl shrink-0"
                    >
                      <Link to={`/assets/${asset.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        Inspect
                      </Link>
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
