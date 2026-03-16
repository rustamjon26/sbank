import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAgingAssets, getRiskyAssets, getSuspiciousAssets } from '@/db/api';
import type { DashboardStats, AssetWithOwner } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  AlertTriangle,
  Clock,
  Shield,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  REGISTERED: 'hsl(var(--chart-1))',
  ASSIGNED: 'hsl(var(--chart-2))',
  IN_REPAIR: 'hsl(var(--chart-3))',
  LOST: 'hsl(var(--chart-4))',
  WRITTEN_OFF: 'hsl(var(--chart-5))',
};

const CATEGORY_COLORS = {
  IT: 'hsl(var(--chart-1))',
  OFFICE: 'hsl(var(--chart-2))',
  SECURITY: 'hsl(var(--chart-3))',
  NETWORK: 'hsl(var(--chart-4))',
  OTHER: 'hsl(var(--chart-5))',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agingAssets, setAgingAssets] = useState<AssetWithOwner[]>([]);
  const [riskyAssets, setRiskyAssets] = useState<AssetWithOwner[]>([]);
  const [suspiciousAssets, setSuspiciousAssets] = useState<AssetWithOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, aging, risky, suspicious] = await Promise.all([
        getDashboardStats(),
        getAgingAssets(),
        getRiskyAssets(),
        getSuspiciousAssets(),
      ]);
      setStats(statsData);
      setAgingAssets(aging);
      setRiskyAssets(risky);
      setSuspiciousAssets(suspicious);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="h-4 w-96 mt-2 bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 bg-muted" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = Object.entries(stats.by_status).map(([name, value]) => ({
    name,
    value,
  }));

  const categoryData = Object.entries(stats.by_category).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your asset management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_assets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aging Assets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aging_assets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.risky_assets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need immediate review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspicious_assets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Anomalies detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets by Status</CardTitle>
            <CardDescription>Distribution of asset statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {riskyAssets.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Risk Assets Detected</AlertTitle>
          <AlertDescription>
            {riskyAssets.length} asset(s) have been flagged as high risk. Review them immediately.
            <Link to="/assets" className="ml-2 underline font-medium">
              View Assets
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {suspiciousAssets.length > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Suspicious Activity</AlertTitle>
          <AlertDescription>
            {suspiciousAssets.length} asset(s) show suspicious patterns. Investigation recommended.
            <Link to="/assets" className="ml-2 underline font-medium">
              View Assets
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Aging Assets */}
      {agingAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aging Assets</CardTitle>
            <CardDescription>Assets that may need replacement soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agingAssets.slice(0, 5).map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {asset.serial_number} • {asset.category}
                    </p>
                  </div>
                  <Link to={`/assets/${asset.id}`}>
                    <Button variant="ghost" size="sm" asChild>
                      <span>
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
