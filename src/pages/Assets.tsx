import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllAssets, createAsset } from "@/db/api";
import type {
  AssetWithOwner,
  CreateAssetInput,
  AssetCategory,
  AssetStatus,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/assets/StatusBadge";
import { ImageUpload } from "@/components/assets/ImageUpload";
import { toast } from "sonner";
import { Plus, Search, Boxes, ShieldAlert, Wrench, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  asset_type: z.string().min(1, "Asset type is required"),
  category: z.enum(["IT", "OFFICE", "SECURITY", "NETWORK", "OTHER"]),
  serial_number: z.string().min(1, "Serial number is required"),
  purchase_date: z.string().min(1, "Purchase date is required"),
  branch: z.string().min(1, "Branch is required"),
  department: z.string().min(1, "Department is required"),
});

const statusOptions: Array<AssetStatus | "ALL"> = [
  "ALL",
  "REGISTERED",
  "ASSIGNED",
  "IN_REPAIR",
  "LOST",
  "WRITTEN_OFF",
];
const categoryOptions: Array<AssetCategory | "ALL"> = [
  "ALL",
  "IT",
  "OFFICE",
  "SECURITY",
  "NETWORK",
  "OTHER",
];

export default function Assets() {
  const [assets, setAssets] = useState<AssetWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "ALL">(
    "ALL",
  );
  const [imageUrl, setImageUrl] = useState<string>("");

  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      asset_type: "",
      category: "IT",
      serial_number: "",
      purchase_date: "",
      branch: "",
      department: "",
    },
  });

  useEffect(() => {
    loadAssets();
  }, []);
  const loadAssets = async () => {
    try {
      setLoading(true);
      setAssets(await getAllAssets());
    } catch (error) {
      console.error("Failed to load assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          asset.name.toLowerCase().includes(q) ||
          asset.serial_number.toLowerCase().includes(q) ||
          asset.asset_type.toLowerCase().includes(q) ||
          asset.owner?.first_name?.toLowerCase().includes(q) ||
          asset.owner?.last_name?.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "ALL" || asset.status === statusFilter;
        const matchesCategory =
          categoryFilter === "ALL" || asset.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      }),
    [assets, searchQuery, statusFilter, categoryFilter],
  );

  const onSubmit = async (values: z.infer<typeof assetSchema>) => {
    try {
      const input: CreateAssetInput = {
        ...values,
        image_url: imageUrl || undefined,
      };
      await createAsset(input);
      toast.success("Asset created successfully");
      setDialogOpen(false);
      form.reset();
      setImageUrl("");
      loadAssets();
    } catch (error) {
      console.error("Failed to create asset:", error);
      toast.error("Failed to create asset");
    }
  };

  const totalAssigned = assets.filter(
    (item) => item.status === "ASSIGNED",
  ).length;
  const totalRepair = assets.filter(
    (item) => item.status === "IN_REPAIR",
  ).length;
  const totalCritical = assets.filter(
    (item) => item.status === "LOST" || item.status === "WRITTEN_OFF",
  ).length;

  if (loading)
    return (
      <div className="page-section">
        <Skeleton className="h-40 rounded-3xl bg-muted/70" />
        <div className="data-grid">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-muted/70" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-3xl bg-muted/70" />
      </div>
    );

  return (
    <div className="page-section">
      <section className="hero-panel">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
              Asset workspace
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Control every asset from registration to write-off.
            </h1>
            <p className="section-subtitle max-w-2xl text-foreground/70">
              Add new equipment, track ownership, filter by lifecycle state, and
              open full asset passports with QR, history, and audit data.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl px-5 py-6 text-sm font-medium shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Add asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle>Create new asset</DialogTitle>
                <DialogDescription>
                  Add a new device or office asset to the central registry.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dell Latitude 7420" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="asset_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset type</FormLabel>
                          <FormControl>
                            <Input placeholder="Laptop" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="OFFICE">Office</SelectItem>
                              <SelectItem value="SECURITY">Security</SelectItem>
                              <SelectItem value="NETWORK">Network</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="serial_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial number</FormLabel>
                          <FormControl>
                            <Input placeholder="SN-LTP-2026-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchase_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <Input placeholder="Headquarters" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Operations" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormLabel>Asset image</FormLabel>
                    <div className="mt-2">
                      <ImageUpload
                        onUploadComplete={setImageUrl}
                        currentImage={imageUrl}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create asset</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="data-grid">
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Total assets
                </div>
                <div className="mt-3 text-3xl font-semibold">
                  {assets.length}
                </div>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Assigned</div>
                <div className="mt-3 text-3xl font-semibold">
                  {totalAssigned}
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">In repair</div>
                <div className="mt-3 text-3xl font-semibold">{totalRepair}</div>
              </div>
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card rounded-3xl">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Critical</div>
                <div className="mt-3 text-3xl font-semibold">
                  {totalCritical}
                </div>
              </div>
              <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="glass-card rounded-3xl">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Asset inventory</CardTitle>
              <CardDescription>
                Search, filter, and jump straight into asset detail pages.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-auto md:flex-row">
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search asset, serial, type, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as AssetStatus | "ALL")
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "ALL" ? "All statuses" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as AssetCategory | "ALL")
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "ALL" ? "All categories" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="soft-scrollbar overflow-x-auto rounded-2xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-16 text-center text-muted-foreground"
                    >
                      No assets match your current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.serial_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{asset.asset_type}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{asset.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{asset.branch}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={asset.status} />
                      </TableCell>
                      <TableCell>
                        {asset.owner
                          ? `${asset.owner.first_name} ${asset.owner.last_name}`
                          : "Unassigned"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Link to={`/assets/${asset.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
