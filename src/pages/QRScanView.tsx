import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicAssetData } from "@/db/api";
import { StatusBadge } from "@/components/assets/StatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  User,
  MapPin,
  Building2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Info,
  Clock,
} from "lucide-react";

interface PublicAsset {
  name: string;
  serial_number: string;
  category: string;
  status: string;
  image_url: string | null;
  branch: string;
  department: string;
  asset_type: string;
  owner_display_name: string | null;
  created_at: string;
  last_verified_at: string | null;
}

export default function QRScanView() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<PublicAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPublicAssetData(id);
        setAsset(data);
      } catch (err) {
        console.error("Failed to load asset", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center p-6 bg-gradient-to-b from-primary/5 to-background">
        <Skeleton className="h-8 w-48 mb-8 mt-12 rounded-full" />
        <Card className="w-full max-w-md rounded-[32px] border-none shadow-2xl overflow-hidden">
          <div className="h-56 bg-muted animate-pulse" />
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md text-center py-12 rounded-[40px] border-none shadow-2xl glass-card">
          <CardContent>
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Asset Not Found</h2>
            <p className="text-muted-foreground mb-8 px-4 text-balance">
              The scanned secure identifier does not match any active asset in
              our verified registry.
            </p>
            <Button
              asChild
              className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20"
            >
              <Link to="/login" className="flex items-center gap-2">
                Back to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center p-4 sm:p-6 pb-20 bg-gradient-to-b from-primary/10 to-background overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md pt-8 pb-8 flex flex-col items-center gap-3 relative z-10">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-background/80 backdrop-blur-md rounded-full border border-primary/20 shadow-sm mb-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
            SmartAsset Verified
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90">
          Public Asset Passport
        </h1>
      </div>

      <Card className="w-full max-w-md rounded-[32px] border-none shadow-2xl overflow-hidden bg-background/60 backdrop-blur-xl relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/5 dark:to-transparent pointer-events-none" />

        {asset.image_url ? (
          <div className="w-full h-64 relative group">
            <img
              src={asset.image_url}
              alt={asset.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-6">
              <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 transition-colors">
                Verified Photo
              </Badge>
            </div>
          </div>
        ) : (
          <div className="w-full h-40 bg-muted/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <Package className="h-12 w-12" />
              <span className="text-xs font-medium">No official photo</span>
            </div>
          </div>
        )}

        <CardHeader className="pt-8 pb-4">
          <div className="flex justify-between items-start mb-4">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 border-none bg-primary/10 text-primary font-bold"
            >
              {asset.category}
            </Badge>
            <StatusBadge status={asset.status as any} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {asset.name}
          </CardTitle>
          <CardDescription className="text-base font-medium flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">S/N:</span>
            <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
              {asset.serial_number}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-10">
          {/* Owner Highlight Card */}
          <div className="relative group overflow-hidden rounded-[24px] bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 p-5 p-px h-full">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -z-10 dark:bg-black/20" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] mb-0.5">
                  Current Accountability
                </p>
                <p className="text-lg font-bold text-foreground truncate">
                  {asset.owner_display_name || "Central Registry"}
                </p>
                <p className="text-[10px] text-primary/70 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Assigned on{" "}
                  {new Date(asset.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-[20px] border border-border/40 hover:bg-muted/40 transition-colors">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-wider mb-2">
                <Building2 className="h-3 w-3 text-primary" /> Branch location
              </p>
              <p className="text-sm font-bold text-foreground leading-tight">
                {asset.branch}
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-[20px] border border-border/40 hover:bg-muted/40 transition-colors">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-wider mb-2">
                <MapPin className="h-3 w-3 text-primary" /> Dept Unit
              </p>
              <p className="text-sm font-bold text-foreground leading-tight">
                {asset.department}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/60 px-2 uppercase tracking-widest bg-muted/20 py-1.5 rounded-lg border border-border/30">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> Verification Log
              </span>
              <span>
                {asset.last_verified_at
                  ? "Security Audit Passed"
                  : "Pending Audit"}
              </span>
            </div>
            {asset.last_verified_at && (
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Last verified on{" "}
                {new Date(asset.last_verified_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="pt-8 flex flex-col gap-3">
            <Button
              className="w-full h-12 rounded-2xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10"
              asChild
            >
              <Link
                to="/login"
                className="flex items-center justify-center gap-2"
              >
                System Administrator Login <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed max-w-[200px] mx-auto">
              Scanned on {new Date().toLocaleString()} for secure validation
              purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center max-w-xs text-balance opacity-50 relative z-10 pointer-events-none">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
          Encryption: SHA-256 HMAC SECURED
        </p>
      </div>
    </div>
  );
}
