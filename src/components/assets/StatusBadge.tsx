import type { AssetStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: AssetStatus;
}

const STATUS_CONFIG = {
  REGISTERED: { label: 'Registered', variant: 'secondary' as const },
  ASSIGNED: { label: 'Assigned', variant: 'default' as const },
  IN_REPAIR: { label: 'In Repair', variant: 'outline' as const },
  LOST: { label: 'Lost', variant: 'destructive' as const },
  WRITTEN_OFF: { label: 'Written Off', variant: 'destructive' as const },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
