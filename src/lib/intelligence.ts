// ============ INTELLIGENCE UTILITIES ============
// Deterministic AI-style summary generation and replacement recommendation logic.

import type { AssetIntelligence, AssetWithOwner } from "@/types";

// ---- Replacement Recommendation ----
export type ReplacementLevel =
  | "Replace Now"
  | "Monitor Closely"
  | "Safe to Continue";

export function getReplacementRecommendation(
  intel: AssetIntelligence,
  asset: AssetWithOwner,
): { level: ReplacementLevel; reason: string } {
  const ageYears =
    (Date.now() - new Date(asset.purchase_date).getTime()) /
    (1000 * 60 * 60 * 24 * 365);
  const repairCount = intel.health.factors.repair_penalty / 12; // reverse-engineer from penalty

  if (intel.health.score < 40)
    return { level: "Replace Now", reason: "Health score critically low" };
  if (intel.risk.score > 75)
    return {
      level: "Replace Now",
      reason: "Risk score exceeds safe threshold",
    };
  if (ageYears > 5 && repairCount >= 3)
    return {
      level: "Replace Now",
      reason: "Aging hardware with repeated repairs",
    };
  if (intel.health.score <= 65 || intel.risk.score >= 50)
    return {
      level: "Monitor Closely",
      reason: "Moderate degradation signals detected",
    };
  return {
    level: "Safe to Continue",
    reason: "Asset operating within normal parameters",
  };
}

// ---- AI Audit Summary Generator ----
export function generateAIAuditSummary(
  intel: AssetIntelligence,
  asset: AssetWithOwner,
): string {
  const parts: string[] = [];
  const ageYears =
    (Date.now() - new Date(asset.purchase_date).getTime()) /
    (1000 * 60 * 60 * 24 * 365);
  const repairCount = Math.round(intel.health.factors.repair_penalty / 12);
  const ownerChanges = Math.round(
    intel.health.factors.owner_change_penalty / 4,
  );
  const daysSinceVerify = Math.round(
    (intel.health.factors.verification_penalty / 3) * 30,
  );

  // Opening assessment
  if (intel.health.level === "Critical") {
    parts.push(
      `This asset is in critical condition with a health score of ${intel.health.score}/100.`,
    );
  } else if (intel.health.level === "Warning") {
    parts.push(
      `This asset shows warning signs with a health score of ${intel.health.score}/100.`,
    );
  } else {
    parts.push(
      `This asset is in good operational condition with a health score of ${intel.health.score}/100.`,
    );
  }

  // Age factor
  if (ageYears > 5) {
    parts.push(
      `The device is ${ageYears.toFixed(1)} years old, significantly past its expected lifecycle.`,
    );
  } else if (ageYears > 3) {
    parts.push(
      `At ${ageYears.toFixed(1)} years old, this asset is entering its late lifecycle.`,
    );
  }

  // Repair history
  if (repairCount >= 3) {
    parts.push(
      `It has undergone ${repairCount} repairs, indicating persistent hardware issues.`,
    );
  } else if (repairCount >= 1) {
    parts.push(
      `${repairCount} repair${repairCount > 1 ? "s" : ""} recorded in its history.`,
    );
  }

  // Owner changes
  if (ownerChanges >= 4) {
    parts.push(
      `Unusually high ownership turnover (${ownerChanges} transfers) suggests operational instability.`,
    );
  } else if (ownerChanges >= 2) {
    parts.push(`${ownerChanges} ownership transfers have occurred.`);
  }

  // Verification
  if (daysSinceVerify > 365) {
    parts.push(
      `The asset has not been verified in over a year, violating audit compliance policy.`,
    );
  } else if (daysSinceVerify > 180) {
    parts.push(
      `Last verification was ${daysSinceVerify} days ago — overdue for re-verification.`,
    );
  }

  // Status flags
  if (asset.status === "LOST") {
    parts.push(`⚠ Asset is currently marked as LOST.`);
  } else if (asset.status === "IN_REPAIR") {
    parts.push(`Asset is currently undergoing repair.`);
  } else if (asset.status === "WRITTEN_OFF") {
    parts.push(`Asset has been permanently written off.`);
  }

  // Suspicious flags
  if (intel.is_suspicious && intel.suspicious_reasons.length > 0) {
    parts.push(
      `Audit anomalies detected: ${intel.suspicious_reasons.join("; ")}.`,
    );
  }

  // Recommendation
  const rec = getReplacementRecommendation(intel, asset);
  if (rec.level === "Replace Now") {
    parts.push(
      `Recommended action: prepare replacement immediately. ${rec.reason}.`,
    );
  } else if (rec.level === "Monitor Closely") {
    parts.push(
      `Recommended action: schedule inspection and monitor closely. ${rec.reason}.`,
    );
  } else {
    parts.push(
      `No immediate action required. Continue standard maintenance schedule.`,
    );
  }

  return parts.join(" ");
}

// ---- Branch Risk Aggregation ----
export interface BranchRisk {
  branch: string;
  totalAssets: number;
  highRiskAssets: number;
  agingAssets: number;
  lostAssets: number;
  avgHealthScore: number;
}

export function computeBranchRiskComparison(
  assets: AssetWithOwner[],
  riskyAssetIds: Set<string>,
  agingAssetIds: Set<string>,
  healthScores: Map<string, number>,
): BranchRisk[] {
  const branchMap = new Map<
    string,
    {
      total: number;
      risky: number;
      aging: number;
      lost: number;
      healthSum: number;
    }
  >();

  for (const asset of assets) {
    const branch = asset.branch || "Unknown";
    if (!branchMap.has(branch)) {
      branchMap.set(branch, {
        total: 0,
        risky: 0,
        aging: 0,
        lost: 0,
        healthSum: 0,
      });
    }
    const b = branchMap.get(branch)!;
    b.total++;
    if (riskyAssetIds.has(asset.id)) b.risky++;
    if (agingAssetIds.has(asset.id)) b.aging++;
    if (asset.status === "LOST" || asset.status === "WRITTEN_OFF") b.lost++;
    b.healthSum += healthScores.get(asset.id) ?? 100;
  }

  return Array.from(branchMap.entries())
    .map(([branch, b]) => ({
      branch,
      totalAssets: b.total,
      highRiskAssets: b.risky,
      agingAssets: b.aging,
      lostAssets: b.lost,
      avgHealthScore: Math.round(b.healthSum / b.total),
    }))
    .sort(
      (a, b) =>
        b.highRiskAssets - a.highRiskAssets ||
        a.avgHealthScore - b.avgHealthScore,
    );
}
