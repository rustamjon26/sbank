import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@/db/api';
import type {
  AssetWithOwner,
  AssetIntelligence,
  AssetAssignmentHistory,
  AssetStatusHistory,
  AuditLog,
  Employee,
  AssetStatus,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/assets/StatusBadge';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import QRCode from 'qrcode';

const assignSchema = z.object({
  owner_id: z.string().min(1, 'Owner is required'),
  reason: z.string().min(1, 'Reason is required'),
});

const statusSchema = z.object({
  new_status: z.enum(['REGISTERED', 'ASSIGNED', 'IN_REPAIR', 'LOST', 'WRITTEN_OFF']),
  reason: z.string().min(1, 'Reason is required'),
});

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AssetWithOwner | null>(null);
  const [intelligence, setIntelligence] = useState<AssetIntelligence | null>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<AssetAssignmentHistory[]>([]);
  const [statusHistory, setStatusHistory] = useState<AssetStatusHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const assignForm = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      owner_id: '',
      reason: '',
    },
  });

  const statusForm = useForm<z.infer<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      new_status: 'REGISTERED',
      reason: '',
    },
  });

  useEffect(() => {
    if (id) {
      loadAssetData();
    }
  }, [id]);

  const loadAssetData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [assetData, intelligenceData, assignmentData, statusData, auditData, employeesData] = await Promise.all([
        getAssetById(id),
        calculateAssetIntelligence(id),
        getAssetAssignmentHistory(id),
        getAssetStatusHistory(id),
        getAuditLogs({ entity_id: id }),
        getAllEmployees(),
      ]);

      if (!assetData) {
        toast.error('Asset not found');
        navigate('/assets');
        return;
      }

      setAsset(assetData);
      setIntelligence(intelligenceData);
      setAssignmentHistory(assignmentData);
      setStatusHistory(statusData);
      setAuditLogs(auditData);
      setEmployees(employeesData);

      // Generate QR code
      if (assetData.qr_code_data) {
        const qrUrl = await QRCode.toDataURL(assetData.qr_code_data, {
          width: 300,
          margin: 2,
        });
        setQrCodeUrl(qrUrl);
      }
    } catch (error) {
      console.error('Failed to load asset data:', error);
      toast.error('Failed to load asset data');
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
        owner_type: 'employee',
        owner_name: `${employee.first_name} ${employee.last_name}`,
        reason: values.reason,
      });

      toast.success('Asset assigned successfully');
      setAssignDialogOpen(false);
      assignForm.reset();
      loadAssetData();
    } catch (error: unknown) {
      console.error('Failed to assign asset:', error);
      toast.error((error as Error).message || 'Failed to assign asset');
    }
  };

  const handleReturn = async () => {
    if (!id) return;

    try {
      await returnAsset(id, 'Asset returned by user');
      toast.success('Asset returned successfully');
      loadAssetData();
    } catch (error) {
      console.error('Failed to return asset:', error);
      toast.error('Failed to return asset');
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

      toast.success('Status changed successfully');
      setStatusDialogOpen(false);
      statusForm.reset();
      loadAssetData();
    } catch (error: unknown) {
      console.error('Failed to change status:', error);
      toast.error((error as Error).message || 'Failed to change status');
    }
  };

  const handleVerify = async () => {
    if (!id) return;

    try {
      await verifyAsset(id);
      toast.success('Asset verified successfully');
      loadAssetData();
    } catch (error) {
      console.error('Failed to verify asset:', error);
      toast.error('Failed to verify asset');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  if (!asset || !intelligence) return null;

  const healthColor = intelligence.health.level === 'Healthy' ? 'text-chart-2' : intelligence.health.level === 'Warning' ? 'text-chart-4' : 'text-destructive';
  const riskColor = intelligence.risk.level === 'Low' ? 'text-chart-2' : intelligence.risk.level === 'Medium' ? 'text-chart-4' : 'text-destructive';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
            <p className="text-muted-foreground mt-1">
              {asset.serial_number} • {asset.category}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleVerify}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verify
          </Button>
          {asset.current_owner_id && (
            <Button variant="outline" onClick={handleReturn}>
              Return Asset
            </Button>
          )}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>Assign Asset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Asset</DialogTitle>
                <DialogDescription>
                  Assign this asset to an employee
                </DialogDescription>
              </DialogHeader>
              <Form {...assignForm}>
                <form onSubmit={assignForm.handleSubmit(handleAssign)} className="space-y-4">
                  <FormField
                    control={assignForm.control}
                    name="owner_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.first_name} {employee.last_name} - {employee.department}
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
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Reason for assignment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Assign</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Status</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Asset Status</DialogTitle>
                <DialogDescription>
                  Update the status of this asset
                </DialogDescription>
              </DialogHeader>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(handleStatusChange)} className="space-y-4">
                  <FormField
                    control={statusForm.control}
                    name="new_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="REGISTERED">Registered</SelectItem>
                            <SelectItem value="ASSIGNED">Assigned</SelectItem>
                            <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                            <SelectItem value="LOST">Lost</SelectItem>
                            <SelectItem value="WRITTEN_OFF">Written Off</SelectItem>
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
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Reason for status change" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Status</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={asset.status} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="outline">{asset.category}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" /> Asset Type
                </p>
                <p className="font-medium">{asset.asset_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Purchase Date
                </p>
                <p className="font-medium">{new Date(asset.purchase_date).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Branch
                </p>
                <p className="font-medium">{asset.branch}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Department
                </p>
                <p className="font-medium">{asset.department}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Current Owner
                </p>
                <p className="font-medium">
                  {asset.owner ? `${asset.owner.first_name} ${asset.owner.last_name}` : 'Unassigned'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${healthColor}`}>
                  {intelligence.health.score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {intelligence.health.level}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${riskColor}`}>
                  {intelligence.risk.score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {intelligence.risk.level} Risk
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {intelligence.is_suspicious && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Suspicious Activity Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {intelligence.suspicious_reasons.map((reason, index) => (
                <li key={index} className="text-sm">{reason}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="assignment" className="w-full">
        <TabsList>
          <TabsTrigger value="assignment">Assignment History</TabsTrigger>
          <TabsTrigger value="status">Status History</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="assignment">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
              <CardDescription>Track of all asset assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignmentHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No assignment history</p>
                ) : (
                  assignmentHistory.map((history) => (
                    <div key={history.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{history.owner_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.assigned_at).toLocaleString()}
                          {history.returned_at && ` - ${new Date(history.returned_at).toLocaleString()}`}
                        </p>
                        {history.reason && (
                          <p className="text-sm mt-1">{history.reason}</p>
                        )}
                      </div>
                      <Badge variant={history.returned_at ? 'secondary' : 'default'}>
                        {history.returned_at ? 'Returned' : 'Active'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Timeline of status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No status history</p>
                ) : (
                  statusHistory.map((history) => (
                    <div key={history.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No audit logs</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge>{log.action_type}</Badge>
                          <span className="text-sm text-muted-foreground">by {log.user_name || 'System'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.reason && (
                          <p className="text-sm mt-1">{log.reason}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
