import type {
  Asset,
  AssetWithOwner,
  AssetAssignmentHistory,
  AssetStatusHistory,
  AuditLog,
  AssetHealthScore,
  AssetRiskScore,
  AssetIntelligence,
} from "@/types";

export function calculateAssetAgeYears(purchaseDate: string): number {
  const now = new Date();
  const purchased = new Date(purchaseDate);
  return (now.getTime() - purchased.getTime()) / (1000 * 60 * 60 * 24 * 365);
}

export function calculateAssetHealth(
  asset: Asset,
  statusHistory: AssetStatusHistory[],
  assignmentHistory: AssetAssignmentHistory[],
  _auditLogs: AuditLog[],
  ageYears: number,
): Pick<AssetHealthScore, "score" | "level" | "factors"> {
  const repairCount = statusHistory.filter(
    (h) => h.new_status === "IN_REPAIR",
  ).length;
  const ownerChangeCount = assignmentHistory.length;
  const auditIssueCount = statusHistory.filter(
    (h) => h.new_status === "LOST" || h.new_status === "IN_REPAIR",
  ).length;

  const now = new Date();
  const daysSinceVerification = asset.last_verified_at
    ? (now.getTime() - new Date(asset.last_verified_at).getTime()) /
      (1000 * 60 * 60 * 24)
    : 365;

  const age_penalty = ageYears * 8;
  const repair_penalty = repairCount * 12;
  const owner_change_penalty = ownerChangeCount * 4;
  const audit_issue_penalty = auditIssueCount * 10;
  const verification_penalty = (daysSinceVerification / 30) * 3;
  let status_penalty = 0;
  if (asset.status === "IN_REPAIR") status_penalty = 20;
  if (asset.status === "LOST") status_penalty = 50;
  if (asset.status === "WRITTEN_OFF") status_penalty = 100;

  let healthScore =
    100 -
    age_penalty -
    repair_penalty -
    owner_change_penalty -
    audit_issue_penalty -
    verification_penalty -
    status_penalty;

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  const level: AssetHealthScore["level"] =
    healthScore < 40 ? "Critical" : healthScore < 65 ? "Warning" : "Healthy";

  return {
    score: healthScore,
    level,
    factors: {
      age_penalty,
      repair_penalty,
      owner_change_penalty,
      audit_issue_penalty,
      verification_penalty,
      status_penalty,
    },
  };
}

export function calculateAssetRisk(
  asset: Asset,
  statusHistory: AssetStatusHistory[],
  assignmentHistory: AssetAssignmentHistory[],
  auditLogs: AuditLog[],
  ageYears: number,
): Pick<AssetRiskScore, "score" | "level" | "factors"> {
  const commentIssueKeywords = [
    "broken",
    "damaged",
    "faulty",
    "malfunction",
    "error",
    "problem",
    "issue",
    "defect",
  ];
  const commentIssueCount = auditLogs.filter(
    (log) =>
      log.reason &&
      commentIssueKeywords.some((kw) => log.reason!.toLowerCase().includes(kw)),
  ).length;

  const repairCount = statusHistory.filter(
    (h) => h.new_status === "IN_REPAIR",
  ).length;
  const ownerChangeCount = assignmentHistory.length;
  const auditIssueCount = statusHistory.filter(
    (h) => h.new_status === "LOST" || h.new_status === "IN_REPAIR",
  ).length;

  const now = new Date();
  const daysSinceVerification = asset.last_verified_at
    ? (now.getTime() - new Date(asset.last_verified_at).getTime()) /
      (1000 * 60 * 60 * 24)
    : 365;

  const age_factor = ageYears > 5 ? 20 : ageYears > 3 ? 10 : 0;
  const repair_factor =
    repairCount >= 3 ? 25 : repairCount === 2 ? 15 : repairCount === 1 ? 5 : 0;
  const instability_factor =
    ownerChangeCount >= 4 ? 15 : ownerChangeCount >= 2 ? 8 : 0;
  const audit_factor =
    auditIssueCount >= 2 ? 20 : auditIssueCount === 1 ? 10 : 0;
  const comment_issue_factor = commentIssueCount >= 2 ? 10 : 0;
  const missing_verification_factor = daysSinceVerification > 180 ? 10 : 0;

  const riskScore =
    age_factor +
    repair_factor +
    instability_factor +
    audit_factor +
    comment_issue_factor +
    missing_verification_factor;

  const level: AssetRiskScore["level"] =
    riskScore > 60 ? "High" : riskScore >= 30 ? "Medium" : "Low";

  return {
    score: riskScore,
    level,
    factors: {
      age_factor,
      repair_factor,
      instability_factor,
      audit_factor,
      comment_issue_factor,
      missing_verification_factor,
    },
  };
}

export function calculateAssetIntelligenceFromData(
  asset: Asset,
  statusHistory: AssetStatusHistory[],
  assignmentHistory: AssetAssignmentHistory[],
  auditLogs: AuditLog[],
): AssetIntelligence {
  const ageYears = calculateAssetAgeYears(asset.purchase_date);
  const health = calculateAssetHealth(
    asset,
    statusHistory,
    assignmentHistory,
    auditLogs,
    ageYears,
  );
  const risk = calculateAssetRisk(
    asset,
    statusHistory,
    assignmentHistory,
    auditLogs,
    ageYears,
  );

  const now = new Date();
  const daysSinceVerification = asset.last_verified_at
    ? (now.getTime() - new Date(asset.last_verified_at).getTime()) /
      (1000 * 60 * 60 * 24)
    : 365;

  const suspiciousReasons: string[] = [];
  if (asset.status === "ASSIGNED" && !asset.current_owner_id) {
    suspiciousReasons.push("Asset marked ASSIGNED but no active owner exists");
  }
  if (asset.status === "LOST") {
    const lostTime =
      statusHistory.find((s) => s.new_status === "LOST")?.changed_at || 0;
    const laterAssignments = assignmentHistory.filter(
      (h) => new Date(h.assigned_at) > new Date(lostTime),
    );
    if (laterAssignments.length > 0)
      suspiciousReasons.push("Asset marked LOST but later reassigned");
  }
  if (assignmentHistory.length >= 5) {
    const recentChanges = assignmentHistory.filter(
      (h) =>
        new Date(h.assigned_at) >
        new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    );
    if (recentChanges.length >= 3)
      suspiciousReasons.push(
        "Asset changed owners unusually often in short period",
      );
  }
  if (!asset.last_verified_at || daysSinceVerification > 365) {
    suspiciousReasons.push("Asset not verified during active audit cycle");
  }

  const repairCount = statusHistory.filter(
    (h) => h.new_status === "IN_REPAIR",
  ).length;
  const isAging = ageYears > 3 && health.score < 60 && repairCount >= 2;

  return {
    health,
    risk,
    replacement_recommended: health.score < 40 || risk.score > 75,
    is_aging: isAging,
    is_suspicious: suspiciousReasons.length > 0,
    suspicious_reasons: suspiciousReasons,
  };
}

// ---- Replacement Recommendation ----
export type ReplacementLevel =
  | "Replace Now"
  | "Monitor Closely"
  | "Safe to Continue";

export function getReplacementRecommendation(
  intel: AssetIntelligence,
  asset: AssetWithOwner,
): { level: ReplacementLevel; reason: string } {
  const ageYears = calculateAssetAgeYears(asset.purchase_date);
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
  const ageYears = calculateAssetAgeYears(asset.purchase_date);
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
  healthMap: Map<string, number>,
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
    b.healthSum += healthMap.get(asset.id) ?? 100;
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
