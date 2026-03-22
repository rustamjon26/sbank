import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssetById,
  calculateAssetIntelligence,
  getAssetAssignmentHistory,
  getAssetStatusHistory,
  getAuditLogs,
  assignAsset,
  returnAsset,
  changeAssetStatus,
  verifyAsset,
  getAllEmployees,
  reportAssetIssue,
  markAssetMissing,
} from "@/db/api";
import type {
  AssetWithOwner,
  AssetIntelligence,
  AssetAssignmentHistory,
  AssetStatusHistory,
  AuditLog,
  Employee,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/assets/StatusBadge";
import {
  HealthBadge,
  RiskBadge,
  ReplacementBadge,
} from "@/components/assets/HealthRiskBadge";
import { AIAuditSummaryCard } from "@/components/assets/AIAuditSummary";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { getReplacementRecommendation } from "@/lib/intelligence";
import { toast } from "sonner";
import {
  ArrowLeft,
  QrCode,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Package,
  Calendar,
  MapPin,
  Building2,
  Shield,
  XCircle,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import QRCode from "qrcode";

const assignSchema = z.object({
  owner_id: z.string().min(1, "Please select an employee"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});
const statusSchema = z.object({
  new_status: z.enum([
    "REGISTERED",
    "ASSIGNED",
    "IN_REPAIR",
    "LOST",
    "WRITTEN_OFF",
  ]),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AssetWithOwner | null>(null);
  const [intelligence, setIntelligence] = useState<AssetIntelligence | null>(
    null,
  );
  const [assignmentHistory, setAssignmentHistory] = useState<
    AssetAssignmentHistory[]
  >([]);
  const [statusHistory, setStatusHistory] = useState<AssetStatusHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  // Quick Audit modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const assignForm = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: { owner_id: "", reason: "" },
  });
  const statusForm = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: { new_status: "REGISTERED", reason: "" },
  });

  useEffect(() => {
    if (id) loadAssetData();
  }, [id]);

  const loadAssetData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [
        assetData,
        intelligenceData,
        assignmentData,
        statusData,
        auditData,
        employeesData,
      ] = await Promise.all([
        getAssetById(id),
        calculateAssetIntelligence(id),
        getAssetAssignmentHistory(id),
        getAssetStatusHistory(id),
        getAuditLogs({ entity_id: id }),
        getAllEmployees(),
      ]);
      if (!assetData) {
        toast.error("Asset not found");
        navigate("/assets");
        return;
      }
      setAsset(assetData);
      setIntelligence(intelligenceData);
      setAssignmentHistory(assignmentData);
      setStatusHistory(statusData);
      setAuditLogs(auditData);
      setEmployees(employeesData);
      if (assetData.qr_code_data) {
        const qrUrl = await QRCode.toDataURL(assetData.qr_code_data, {
          width: 300,
          margin: 2,
        });
        setQrCodeUrl(qrUrl);
      }
    } catch (error) {
      console.error("Failed to load asset data:", error);
      toast.error("Failed to load asset data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (values: z.infer<typeof assignSchema>) => {
    if (!id) return;
    try {
      const employee = employees.find((e) => e.id === values.owner_id);
      if (!employee) return;
      await assignAsset({
        asset_id: id,
        owner_id: values.owner_id,
        owner_type: "employee",
        owner_name: `${employee.first_name} ${employee.last_name}`,
        reason: values.reason,
      });
      toast.success("Asset assigned successfully");
      setAssignDialogOpen(false);
      assignForm.reset();
      loadAssetData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to assign asset");
    }
  };

  const handleReturn = async () => {
    if (!id) return;
    try {
      await returnAsset(id, "Asset returned by user");
      toast.success("Asset returned successfully");
      loadAssetData();
    } catch (error) {
      toast.error("Failed to return asset");
    }
  };

  const handleStatusChange = async (values: z.infer<typeof statusSchema>) => {
    if (!id) return;
    try {
      await changeAssetStatus({
        asset_id: id,
        new_status: values.new_status,
        reason: values.reason,
      });
      toast.success("Status changed successfully");
      setStatusDialogOpen(false);
      statusForm.reset();
      loadAssetData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to change status");
    }
  };

  const handleVerify = async () => {
    if (!id) return;
    try {
      await verifyAsset(id);
      toast.success("✅ Asset verified successfully");
      loadAssetData();
    } catch (error) {
      toast.error("Failed to verify asset");
    }
  };

  const handleReportIssue = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await reportAssetIssue(id, "Issue found during audit inspection");
      toast.success("⚠️ Issue reported — asset moved to IN_REPAIR");
      setIssueModalOpen(false);
      loadAssetData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to report issue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkMissing = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await markAssetMissing(id, "Asset could not be located during audit");
      toast.success("🔴 Asset marked as MISSING");
      setMissingModalOpen(false);
      loadAssetData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to mark as missing");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-muted rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-80 rounded-3xl bg-muted md:col-span-2" />
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-3xl bg-muted" />
            <Skeleton className="h-32 rounded-3xl bg-muted" />
            <Skeleton className="h-32 rounded-3xl bg-muted" />
          </div>
        </div>
        <Skeleton className="h-60 rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!asset || !intelligence) return null;

  const rec = getReplacementRecommendation(intelligence, asset);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/assets")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {asset.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {asset.serial_number} • {asset.category}
            </p>
          </div>
        </div>
        {/* Quick Audit Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleVerify}
            className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Verified
          </Button>
          <Button
            variant="outline"
            onClick={() => setIssueModalOpen(true)}
            className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            <AlertTriangle className="mr-2 h-4 w-4" /> Issue Found
          </Button>
          <Button
            variant="outline"
            onClick={() => setMissingModalOpen(true)}
            className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
          >
            <XCircle className="mr-2 h-4 w-4" /> Missing
          </Button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={issueModalOpen}
        onOpenChange={setIssueModalOpen}
        title="Report Issue"
        description="This will mark the asset as IN_REPAIR and create an audit log entry. The asset will be unavailable for assignment until repaired."
        confirmLabel="Report Issue"
        variant="default"
        onConfirm={handleReportIssue}
        loading={actionLoading}
      />
      <ConfirmationModal
        open={missingModalOpen}
        onOpenChange={setMissingModalOpen}
        title="Mark as Missing"
        description="This will mark the asset as LOST and create an audit log entry. LOST assets cannot be reassigned. This action requires admin review to reverse."
        confirmLabel="Mark Missing"
        variant="destructive"
        onConfirm={handleMarkMissing}
        loading={actionLoading}
      />

      {/* AI Audit Summary — Hackathon Winner */}
      <AIAuditSummaryCard intelligence={intelligence} asset={asset} />

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl md:col-span-2">
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.image_url && (
              <img
                src={asset.image_url}
                alt={asset.name}
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={asset.status} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline">{asset.category}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                  <Package className="h-3 w-3" /> Asset Type
                </p>
                <p className="font-medium">{asset.asset_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Purchase Date
                </p>
                <p className="font-medium">
                  {new Date(asset.purchase_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                  <Building2 className="h-3 w-3" /> Branch
                </p>
                <p className="font-medium">{asset.branch}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Department
                </p>
                <p className="font-medium">{asset.department}</p>
              </div>
              <div className="col-span-1 space-y-1 sm:col-span-2">
                <p className="text-sm flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" /> Current Owner
                </p>
                <p className="font-medium">
                  {asset.owner
                    ? `${asset.owner.first_name} ${asset.owner.last_name}`
                    : "Unassigned"}
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              {asset.current_owner_id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleReturn}
                >
                  Return Asset
                </Button>
              )}
              <Dialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl">
                    Assign Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign Asset</DialogTitle>
                    <DialogDescription>
                      Assign this asset to an employee
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...assignForm}>
                    <form
                      onSubmit={assignForm.handleSubmit(handleAssign)}
                      className="space-y-4"
                    >
                      <FormField
                        control={assignForm.control}
                        name="owner_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={
                                    assignForm.formState.errors.owner_id
                                      ? "border-destructive"
                                      : ""
                                  }
                                >
                                  <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {employees.map((e) => (
                                  <SelectItem key={e.id} value={e.id}>
                                    {e.first_name} {e.last_name} -{" "}
                                    {e.department}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={assignForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reason for assignment (min 3 chars)"
                                className={
                                  assignForm.formState.errors.reason
                                    ? "border-destructive"
                                    : ""
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAssignDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Assign</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog
                open={statusDialogOpen}
                onOpenChange={setStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Change Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Change Asset Status</DialogTitle>
                    <DialogDescription>
                      Update the status of this asset
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...statusForm}>
                    <form
                      onSubmit={statusForm.handleSubmit(handleStatusChange)}
                      className="space-y-4"
                    >
                      <FormField
                        control={statusForm.control}
                        name="new_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Status *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="REGISTERED">
                                  Registered
                                </SelectItem>
                                <SelectItem value="ASSIGNED">
                                  Assigned
                                </SelectItem>
                                <SelectItem value="IN_REPAIR">
                                  In Repair
                                </SelectItem>
                                <SelectItem value="LOST">Lost</SelectItem>
                                <SelectItem value="WRITTEN_OFF">
                                  Written Off
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={statusForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reason for status change (min 3 chars)"
                                className={
                                  statusForm.formState.errors.reason
                                    ? "border-destructive"
                                    : ""
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStatusDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Update Status</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: QR, Health, Risk, Replacement */}
        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" /> QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" /> Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <div className="text-4xl font-bold">
                {intelligence.health.score}
              </div>
              <HealthBadge
                score={intelligence.health.score}
                level={intelligence.health.level}
                size="md"
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" /> Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <div className="text-4xl font-bold">
                {intelligence.risk.score}
              </div>
              <RiskBadge score={intelligence.risk.score} size="md" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Replacement</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ReplacementBadge
                level={rec.level}
                reason={rec.reason}
                size="lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suspicious Activity Alert */}
      {intelligence.is_suspicious && (
        <Card className="rounded-3xl border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" /> Suspicious Activity Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {intelligence.suspicious_reasons.map((reason, index) => (
                <li key={index} className="text-sm">
                  {reason}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* History Tabs */}
      <Tabs defaultValue="assignment" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full">
            <TabsTrigger value="assignment">Assignment History</TabsTrigger>
            <TabsTrigger value="status">Status History</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="assignment">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
              <CardDescription>Track of all asset assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentHistory.length === 0 ? (
                <EmptyState
                  icon={User}
                  title="No assignment history"
                  description="This asset has not been assigned to anyone yet."
                />
              ) : (
                <div className="space-y-3">
                  {assignmentHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-start gap-4 p-4 border border-border rounded-2xl"
                    >
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{history.owner_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.assigned_at).toLocaleString()}
                          {history.returned_at &&
                            ` - ${new Date(history.returned_at).toLocaleString()}`}
                        </p>
                        {history.reason && (
                          <p className="text-sm mt-1">{history.reason}</p>
                        )}
                      </div>
                      <Badge
                        variant={history.returned_at ? "secondary" : "default"}
                      >
                        {history.returned_at ? "Returned" : "Active"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Timeline of status changes</CardDescription>
            </CardHeader>
            <CardContent>
              {statusHistory.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No status changes"
                  description="No status transitions have been recorded."
                />
              ) : (
                <div className="space-y-3">
                  {statusHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-start gap-4 p-4 border border-border rounded-2xl"
                    >
                      <Activity className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {history.previous_status && (
                            <>
                              <StatusBadge status={history.previous_status} />
                              <span className="text-muted-foreground">→</span>
                            </>
                          )}
                          <StatusBadge status={history.new_status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(history.changed_at).toLocaleString()}
                        </p>
                        {history.reason && (
                          <p className="text-sm mt-1">{history.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No audit logs"
                  description="No audit entries have been recorded for this asset."
                />
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 border border-border rounded-2xl"
                    >
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{log.action_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {log.user_name || "System"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.reason && (
                          <p className="text-sm mt-1">{log.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
