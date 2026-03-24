import { supabase } from "./supabase";
import type {
  Asset,
  AssetWithOwner,
  Employee,
  Profile,
  AssetAssignmentHistory,
  AssetStatusHistory,
  AuditLog,
  CreateAssetInput,
  AssignAssetInput,
  ChangeStatusInput,
  CreateEmployeeInput,
  UpdateProfileInput,
  DashboardStats,
  AssetHealthScore,
  AssetRiskScore,
  AssetIntelligence,
  AssetStatus,
  AuditActionType,
} from "@/types";

// ============ PROFILES ============
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateProfile(
  id: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ EMPLOYEES ============
export async function getAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "employee",
    entity_id: data.id,
    action_type: "CREATE",
    new_state: data,
    reason: "Employee created",
  });

  return data;
}

export async function updateEmployee(
  id: string,
  input: Partial<CreateEmployeeInput>,
): Promise<Employee> {
  const previous = await getEmployeeById(id);

  const { data, error } = await supabase
    .from("employees")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "employee",
    entity_id: data.id,
    action_type: "UPDATE",
    previous_state: previous,
    new_state: data,
    reason: "Employee updated",
  });

  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  const previous = await getEmployeeById(id);

  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "employee",
    entity_id: id,
    action_type: "DELETE",
    previous_state: previous,
    reason: "Employee deleted",
  });
}

// ============ ASSETS ============
export async function getAllAssets(): Promise<AssetWithOwner[]> {
  const { data: assetsData, error: assetsError } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (assetsError) throw assetsError;

  const assets = Array.isArray(assetsData) ? assetsData : [];

  // Bulk fetch employees to avoid N+1 queries
  const ownerIds = Array.from(
    new Set(
      assets
        .filter(
          (a) => a.current_owner_id && a.current_owner_type === "employee",
        )
        .map((a) => a.current_owner_id as string),
    ),
  );

  let employeesMap: Record<string, Employee> = {};

  if (ownerIds.length > 0) {
    const { data: employeesData } = await supabase
      .from("employees")
      .select("*")
      .in("id", ownerIds);

    if (employeesData) {
      employeesMap = employeesData.reduce(
        (acc, emp) => {
          acc[emp.id] = emp;
          return acc;
        },
        {} as Record<string, Employee>,
      );
    }
  }

  // Map owner details
  return assets.map((asset) => {
    if (asset.current_owner_id && asset.current_owner_type === "employee") {
      return {
        ...asset,
        owner: employeesMap[asset.current_owner_id] || undefined,
      };
    }
    return asset;
  });
}

export async function getAssetById(id: string): Promise<AssetWithOwner | null> {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Fetch owner details
  if (data.current_owner_id && data.current_owner_type === "employee") {
    const owner = await getEmployeeById(data.current_owner_id);
    return { ...data, owner: owner || undefined };
  }

  return data;
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  // Generate QR code data
  const qrCodeData = `ASSET-${input.serial_number}`;

  const { data, error } = await supabase
    .from("assets")
    .insert({ ...input, qr_code_data: qrCodeData })
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "asset",
    entity_id: data.id,
    action_type: "CREATE",
    new_state: data,
    reason: "Asset created",
  });

  // Create status history
  await createStatusHistory({
    asset_id: data.id,
    previous_status: null,
    new_status: "REGISTERED",
    reason: "Initial registration",
  });

  return data;
}

export async function updateAsset(
  id: string,
  input: Partial<CreateAssetInput>,
): Promise<Asset> {
  const previous = await getAssetById(id);

  const { data, error } = await supabase
    .from("assets")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "asset",
    entity_id: data.id,
    action_type: "UPDATE",
    previous_state: previous,
    new_state: data,
    reason: "Asset updated",
  });

  return data;
}

export async function assignAsset(input: AssignAssetInput): Promise<Asset> {
  const asset = await getAssetById(input.asset_id);
  if (!asset) throw new Error("Asset not found");

  // Validate status
  if (asset.status === "LOST") {
    throw new Error("Cannot assign LOST assets");
  }
  if (asset.status === "WRITTEN_OFF") {
    throw new Error("Cannot assign WRITTEN_OFF assets");
  }
  if (asset.status === "IN_REPAIR") {
    throw new Error("Cannot assign assets that are IN_REPAIR");
  }

  // Close previous assignment if exists
  if (asset.current_owner_id) {
    await supabase
      .from("asset_assignment_history")
      .update({ returned_at: new Date().toISOString() })
      .eq("asset_id", input.asset_id)
      .is("returned_at", null);
  }

  // Update asset
  const { data, error } = await supabase
    .from("assets")
    .update({
      current_owner_id: input.owner_id,
      current_owner_type: input.owner_type,
      status: "ASSIGNED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.asset_id)
    .select()
    .single();

  if (error) throw error;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Create assignment history
  await supabase.from("asset_assignment_history").insert({
    asset_id: input.asset_id,
    owner_id: input.owner_id,
    owner_type: input.owner_type,
    owner_name: input.owner_name,
    status_during_assignment: "ASSIGNED",
    reason: input.reason,
    assigned_by: user?.id,
  });

  // Create audit log
  await createAuditLog({
    entity_type: "asset",
    entity_id: data.id,
    action_type: "ASSIGN",
    previous_state: asset,
    new_state: data,
    reason: input.reason,
  });

  // Create status history if status changed
  if (asset.status !== "ASSIGNED") {
    await createStatusHistory({
      asset_id: data.id,
      previous_status: asset.status,
      new_status: "ASSIGNED",
      reason: input.reason,
    });
  }

  return data;
}

export async function returnAsset(
  assetId: string,
  reason: string,
): Promise<Asset> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error("Asset not found");

  // Close current assignment
  await supabase
    .from("asset_assignment_history")
    .update({ returned_at: new Date().toISOString() })
    .eq("asset_id", assetId)
    .is("returned_at", null);

  // Update asset
  const { data, error } = await supabase
    .from("assets")
    .update({
      current_owner_id: null,
      current_owner_type: null,
      status: "REGISTERED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "asset",
    entity_id: data.id,
    action_type: "RETURN",
    previous_state: asset,
    new_state: data,
    reason,
  });

  // Create status history
  await createStatusHistory({
    asset_id: data.id,
    previous_status: asset.status,
    new_status: "REGISTERED",
    reason,
  });

  return data;
}

export async function changeAssetStatus(
  input: ChangeStatusInput,
): Promise<Asset> {
  const asset = await getAssetById(input.asset_id);
  if (!asset) throw new Error("Asset not found");

  // Validate status transitions
  if (asset.status === "WRITTEN_OFF") {
    throw new Error("Cannot change status of WRITTEN_OFF assets");
  }

  const { data, error } = await supabase
    .from("assets")
    .update({
      status: input.new_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.asset_id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "asset",
    entity_id: data.id,
    action_type: "STATUS_CHANGE",
    previous_state: asset,
    new_state: data,
    reason: input.reason,
  });

  // Create status history
  await createStatusHistory({
    asset_id: data.id,
    previous_status: asset.status,
    new_status: input.new_status,
    reason: input.reason,
  });

  return data;
}

export async function verifyAsset(assetId: string): Promise<Asset> {
  const { data, error } = await supabase
    .from("assets")
    .update({
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: "asset",
    entity_id: data.id,
    action_type: "VERIFY",
    new_state: data,
    reason: "Asset verified",
  });

  return data;
}

// ============ ASSIGNMENT HISTORY ============
export async function getAssetAssignmentHistory(
  assetId: string,
): Promise<AssetAssignmentHistory[]> {
  const { data, error } = await supabase
    .from("asset_assignment_history")
    .select("*")
    .eq("asset_id", assetId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ============ STATUS HISTORY ============
export async function getAssetStatusHistory(
  assetId: string,
): Promise<AssetStatusHistory[]> {
  const { data, error } = await supabase
    .from("asset_status_history")
    .select("*")
    .eq("asset_id", assetId)
    .order("changed_at", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function createStatusHistory(input: {
  asset_id: string;
  previous_status: AssetStatus | null;
  new_status: AssetStatus;
  reason: string | null;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("asset_status_history").insert({
    ...input,
    changed_by: user?.id,
  });
}

// ============ AUDIT LOGS ============
export async function getAuditLogs(filters?: {
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  action_type?: AuditActionType;
  limit?: number;
}): Promise<AuditLog[]> {
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }
  if (filters?.entity_id) {
    query = query.eq("entity_id", filters.entity_id);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.action_type) {
    query = query.eq("action_type", filters.action_type);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function createAuditLog(input: {
  entity_type: string;
  entity_id: string;
  action_type: AuditActionType;
  previous_state?: unknown;
  new_state?: unknown;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, first_name, last_name")
    .eq("id", user?.id || "")
    .maybeSingle();

  const userName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.username || "System";

  await supabase.from("audit_logs").insert({
    ...input,
    user_id: user?.id,
    user_name: userName,
    previous_state: input.previous_state as never,
    new_state: input.new_state as never,
  });
}

// ============ DASHBOARD STATS ============
export async function getDashboardOverview(): Promise<{
  stats: DashboardStats;
  agingAssets: AssetWithOwner[];
  riskyAssets: AssetWithOwner[];
  suspiciousAssets: AssetWithOwner[];
  problematicAssets: AssetWithOwner[];
  branchComparison: {
    branch: string;
    totalAssets: number;
    highRiskAssets: number;
    agingAssets: number;
    lostAssets: number;
    avgHealthScore: number;
  }[];
  healthScores: Record<string, number>;
  riskScores: Record<string, number>;
}> {
  const assets = await getAllAssets();

  // Bulk fetch all histories to avoid N+1 queries
  const [
    { data: allAssignments },
    { data: allStatuses },
    { data: allAuditLogs },
  ] = await Promise.all([
    supabase.from("asset_assignment_history").select("*"),
    supabase.from("asset_status_history").select("*"),
    supabase.from("audit_logs").select("*"),
  ]);

  const assignmentsList = Array.isArray(allAssignments)
    ? (allAssignments as AssetAssignmentHistory[])
    : [];
  const statusesList = Array.isArray(allStatuses)
    ? (allStatuses as AssetStatusHistory[])
    : [];
  const auditLogsList = Array.isArray(allAuditLogs)
    ? (allAuditLogs as AuditLog[])
    : [];

  // Group by asset ID
  const assignmentsByAsset = assignmentsList.reduce(
    (acc, curr) => {
      if (!acc[curr.asset_id]) acc[curr.asset_id] = [];
      acc[curr.asset_id].push(curr);
      return acc;
    },
    {} as Record<string, AssetAssignmentHistory[]>,
  );

  const statusesByAsset = statusesList.reduce(
    (acc, curr) => {
      if (!acc[curr.asset_id]) acc[curr.asset_id] = [];
      acc[curr.asset_id].push(curr);
      return acc;
    },
    {} as Record<string, AssetStatusHistory[]>,
  );

  const auditLogsByAsset = auditLogsList.reduce(
    (acc, curr) => {
      if (!acc[curr.entity_id]) acc[curr.entity_id] = [];
      acc[curr.entity_id].push(curr);
      return acc;
    },
    {} as Record<string, AuditLog[]>,
  );

  const stats: DashboardStats = {
    total_assets: assets.length,
    by_status: {
      REGISTERED: 0,
      ASSIGNED: 0,
      IN_REPAIR: 0,
      LOST: 0,
      WRITTEN_OFF: 0,
    },
    by_category: { IT: 0, OFFICE: 0, SECURITY: 0, NETWORK: 0, OTHER: 0 },
    aging_assets: 0,
    risky_assets: 0,
    suspicious_assets: 0,
  };

  const agingAssets: AssetWithOwner[] = [];
  const riskyAssets: AssetWithOwner[] = [];
  const suspiciousAssets: AssetWithOwner[] = [];
  const problematicAssets: AssetWithOwner[] = [];
  const healthScores: Record<string, number> = {};
  const riskScores: Record<string, number> = {};

  const riskyIds = new Set<string>();
  const agingIds = new Set<string>();
  const healthMap = new Map<string, number>();

  for (const asset of assets) {
    stats.by_status[asset.status]++;
    stats.by_category[asset.category]++;

    const assetAssignments = assignmentsByAsset[asset.id] || [];
    const assetStatuses = statusesByAsset[asset.id] || [];
    const assetAuditLogs = auditLogsByAsset[asset.id] || [];

    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();
    const ageYears =
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const repairCount = assetStatuses.filter(
      (h) => h.new_status === "IN_REPAIR",
    ).length;
    const ownerChangeCount = assetAssignments.length;
    const auditIssueCount = assetStatuses.filter(
      (h) => h.new_status === "LOST" || h.new_status === "IN_REPAIR",
    ).length;
    const daysSinceVerification = asset.last_verified_at
      ? (now.getTime() - new Date(asset.last_verified_at).getTime()) /
        (1000 * 60 * 60 * 24)
      : 365;

    // Health Score
    const agePenalty = ageYears * 8;
    const repairPenalty = repairCount * 12;
    const ownerChangePenalty = ownerChangeCount * 4;
    const auditIssuePenalty = auditIssueCount * 10;
    const verificationPenalty = (daysSinceVerification / 30) * 3;
    let statusPenalty = 0;
    if (asset.status === "IN_REPAIR") statusPenalty = 20;
    if (asset.status === "LOST") statusPenalty = 50;
    if (asset.status === "WRITTEN_OFF") statusPenalty = 100;

    let healthScore =
      100 -
      agePenalty -
      repairPenalty -
      ownerChangePenalty -
      auditIssuePenalty -
      verificationPenalty -
      statusPenalty;
    healthScore = Math.max(0, Math.min(100, healthScore));
    healthScores[asset.id] = Math.round(healthScore);
    healthMap.set(asset.id, Math.round(healthScore));

    // Risk Score
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
    const commentIssueCount = assetAuditLogs.filter(
      (log) =>
        log.reason &&
        commentIssueKeywords.some((kw) =>
          log.reason!.toLowerCase().includes(kw),
        ),
    ).length;

    const ageFactor = ageYears > 5 ? 20 : ageYears > 3 ? 10 : 0;
    const repairFactor =
      repairCount >= 3
        ? 25
        : repairCount === 2
          ? 15
          : repairCount === 1
            ? 5
            : 0;
    const instabilityFactor =
      ownerChangeCount >= 4 ? 15 : ownerChangeCount >= 2 ? 8 : 0;
    const auditFactor =
      auditIssueCount >= 2 ? 20 : auditIssueCount === 1 ? 10 : 0;
    const commentIssueFactor = commentIssueCount >= 2 ? 10 : 0;
    const missingVerificationFactor = daysSinceVerification > 180 ? 10 : 0;

    const riskScore =
      ageFactor +
      repairFactor +
      instabilityFactor +
      auditFactor +
      commentIssueFactor +
      missingVerificationFactor;
    riskScores[asset.id] = riskScore;

    // Intelligence Checks
    const isAging = ageYears >= 2; // Adjusted for demo purposes

    const suspiciousReasons: string[] = [];
    if (asset.status === "ASSIGNED" && !asset.current_owner_id) {
      suspiciousReasons.push(
        "Asset marked ASSIGNED but no active owner exists",
      );
    }
    if (asset.status === "LOST") {
      const lostTime =
        assetStatuses.find((s) => s.new_status === "LOST")?.changed_at || 0;
      const laterAssignments = assetAssignments.filter(
        (h) => new Date(h.assigned_at) > new Date(lostTime),
      );
      if (laterAssignments.length > 0)
        suspiciousReasons.push("Asset marked LOST but later reassigned");
    }
    if (assetAssignments.length >= 5) {
      const recentChanges = assetAssignments.filter(
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

    const isSuspicious = suspiciousReasons.length > 0;
    const isHighRisk = riskScore >= 10; // Adjusted for demo purposes

    // Problematic: repeated repairs, high owner turnover, audit anomalies
    const isProblematic =
      repairCount >= 2 ||
      ownerChangeCount >= 4 ||
      (isSuspicious && auditIssueCount >= 2) ||
      commentIssueCount >= 2;

    if (isAging) {
      stats.aging_assets++;
      agingAssets.push(asset);
      agingIds.add(asset.id);
    }
    if (isHighRisk) {
      stats.risky_assets++;
      riskyAssets.push(asset);
      riskyIds.add(asset.id);
    }
    if (isSuspicious) {
      stats.suspicious_assets++;
      suspiciousAssets.push(asset);
    }
    if (isProblematic && !isAging) {
      problematicAssets.push(asset);
    }
  }

  // Branch risk comparison
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
    if (!branchMap.has(branch))
      branchMap.set(branch, {
        total: 0,
        risky: 0,
        aging: 0,
        lost: 0,
        healthSum: 0,
      });
    const b = branchMap.get(branch)!;
    b.total++;
    if (riskyIds.has(asset.id)) b.risky++;
    if (agingIds.has(asset.id)) b.aging++;
    if (asset.status === "LOST" || asset.status === "WRITTEN_OFF") b.lost++;
    b.healthSum += healthMap.get(asset.id) ?? 100;
  }

  const branchComparison = Array.from(branchMap.entries())
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

  return {
    stats,
    agingAssets,
    riskyAssets,
    suspiciousAssets,
    problematicAssets,
    branchComparison,
    healthScores,
    riskScores,
  };
}

// ============ SINGLE ASSET INTELLIGENCE ============
export async function calculateAssetIntelligence(
  assetId: string,
): Promise<AssetIntelligence> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error("Asset not found");

  const [assignmentHistory, statusHistory, auditLogs] = await Promise.all([
    getAssetAssignmentHistory(assetId),
    getAssetStatusHistory(assetId),
    getAuditLogs({ entity_id: assetId }),
  ]);

  const now = new Date();
  const purchaseDate = new Date(asset.purchase_date);
  const ageYears =
    (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const repairCount = statusHistory.filter(
    (h) => h.new_status === "IN_REPAIR",
  ).length;
  const ownerChangeCount = assignmentHistory.length;
  const auditIssueCount = statusHistory.filter(
    (h) => h.new_status === "LOST" || h.new_status === "IN_REPAIR",
  ).length;
  const daysSinceVerification = asset.last_verified_at
    ? (now.getTime() - new Date(asset.last_verified_at).getTime()) /
      (1000 * 60 * 60 * 24)
    : 365;

  // Health Score
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

  const healthLevel: AssetHealthScore["level"] =
    healthScore < 40 ? "Critical" : healthScore < 65 ? "Warning" : "Healthy";

  // Risk Score
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

  const riskLevel: AssetRiskScore["level"] =
    riskScore > 60 ? "High" : riskScore >= 30 ? "Medium" : "Low";

  // Suspicious Reasons
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

  const isAging = ageYears > 3 && healthScore < 60 && repairCount >= 2;

  return {
    health: {
      score: healthScore,
      level: healthLevel,
      factors: {
        age_penalty,
        repair_penalty,
        owner_change_penalty,
        audit_issue_penalty,
        verification_penalty,
        status_penalty,
      },
    },
    risk: {
      score: riskScore,
      level: riskLevel,
      factors: {
        age_factor,
        repair_factor,
        instability_factor,
        audit_factor,
        comment_issue_factor,
        missing_verification_factor,
      },
    },
    replacement_recommended: healthScore < 40 || riskScore > 75,
    is_aging: isAging,
    is_suspicious: suspiciousReasons.length > 0,
    suspicious_reasons: suspiciousReasons,
  };
}

// ============ QUICK AUDIT ACTIONS ============
export async function reportAssetIssue(
  assetId: string,
  reason: string,
): Promise<Asset> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error("Asset not found");

  // Update status to IN_REPAIR
  const { data, error } = await supabase
    .from("assets")
    .update({
      status: "IN_REPAIR" as AssetStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog({
    entity_type: "asset",
    entity_id: assetId,
    action_type: "STATUS_CHANGE",
    previous_state: asset,
    new_state: data,
    reason: `Issue reported: ${reason}`,
  });

  await createStatusHistory({
    asset_id: assetId,
    previous_status: asset.status,
    new_status: "IN_REPAIR",
    reason: `Issue reported: ${reason}`,
  });

  return data;
}

export async function markAssetMissing(
  assetId: string,
  reason?: string,
): Promise<Asset> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error("Asset not found");
  if (asset.status === "WRITTEN_OFF")
    throw new Error("Cannot mark WRITTEN_OFF assets as missing");

  const { data, error } = await supabase
    .from("assets")
    .update({
      status: "LOST" as AssetStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assetId)
    .select()
    .single();

  if (error) throw error;

  await createAuditLog({
    entity_type: "asset",
    entity_id: assetId,
    action_type: "STATUS_CHANGE",
    previous_state: asset,
    new_state: data,
    reason: reason || "Asset marked as missing during audit",
  });

  await createStatusHistory({
    asset_id: assetId,
    previous_status: asset.status,
    new_status: "LOST",
    reason: reason || "Asset marked as missing during audit",
  });

  return data;
}
