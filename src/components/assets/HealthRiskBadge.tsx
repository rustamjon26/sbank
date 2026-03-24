import { cn } from "@/lib/utils";
import { Heart, ShieldAlert } from "lucide-react";

// ---- Health Badge ----
interface HealthBadgeProps {
  score: number;
  level: "Healthy" | "Warning" | "Critical";
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

const HEALTH_STYLES = {
  Healthy:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
  Warning:
    "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800",
  Critical:
    "bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-400 dark:border-rose-800",
};

export function HealthBadge({
  score,
  level,
  size = "sm",
  showScore = true,
}: HealthBadgeProps) {
  const sizeClasses =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : size === "md"
        ? "px-2.5 py-1 text-xs"
        : "px-2 py-0.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        HEALTH_STYLES[level],
        sizeClasses,
      )}
    >
      <Heart
        className={cn("shrink-0", size === "lg" ? "h-4 w-4" : "h-3 w-3")}
      />
      {showScore && <span className="font-semibold">{score}</span>}
      <span>{level}</span>
    </span>
  );
}

// ---- Risk Badge ----
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface RiskBadgeProps {
  score: number;
  level?: RiskLevel;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

const RISK_STYLES: Record<RiskLevel, string> = {
  Low: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
  Medium:
    "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800",
  High: "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800",
  Critical:
    "bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-400 dark:border-rose-800",
};

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "Low";
  if (score <= 60) return "Medium";
  if (score <= 80) return "High";
  return "Critical";
}

export function RiskBadge({
  score,
  level,
  size = "sm",
  showScore = true,
}: RiskBadgeProps) {
  const computedLevel = level ?? getRiskLevel(score);
  const sizeClasses =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : size === "md"
        ? "px-2.5 py-1 text-xs"
        : "px-2 py-0.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        RISK_STYLES[computedLevel],
        sizeClasses,
      )}
    >
      <ShieldAlert
        className={cn("shrink-0", size === "lg" ? "h-4 w-4" : "h-3 w-3")}
      />
      {showScore && <span className="font-semibold">{score}</span>}
      <span>{computedLevel} Risk</span>
    </span>
  );
}

// ---- Replacement Badge ----
import type { ReplacementLevel } from "@/lib/analytics";

interface ReplacementBadgeProps {
  level: ReplacementLevel;
  reason?: string;
  size?: "sm" | "md" | "lg";
}

const REPLACEMENT_STYLES: Record<ReplacementLevel, string> = {
  "Replace Now":
    "bg-rose-500/10 text-rose-700 border-rose-300 dark:text-rose-400 dark:border-rose-800",
  "Monitor Closely":
    "bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800",
  "Safe to Continue":
    "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800",
};

const REPLACEMENT_ICONS: Record<ReplacementLevel, string> = {
  "Replace Now": "🔄",
  "Monitor Closely": "👁️",
  "Safe to Continue": "✅",
};

export function ReplacementBadge({
  level,
  reason,
  size = "md",
}: ReplacementBadgeProps) {
  const sizeClasses =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : size === "md"
        ? "px-3 py-1.5 text-xs"
        : "px-2 py-1 text-xs";

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-0.5 rounded-xl border",
        REPLACEMENT_STYLES[level],
        sizeClasses,
      )}
    >
      <span className="font-semibold flex items-center gap-1.5">
        <span>{REPLACEMENT_ICONS[level]}</span>
        {level}
      </span>
      {reason && <span className="text-[11px] opacity-80">{reason}</span>}
    </div>
  );
}
