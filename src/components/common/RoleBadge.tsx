import { Badge } from "@/components/ui/badge";
import { Shield, Wrench, User } from "lucide-react";
import { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    icon: Shield,
    className: "bg-rose-500/10 text-rose-600 border-rose-200",
  },
  asset_manager: {
    label: "Asset Manager",
    icon: Wrench,
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  employee: {
    label: "Employee",
    icon: User,
    className: "bg-slate-500/10 text-slate-600 border-slate-200",
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.employee;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
