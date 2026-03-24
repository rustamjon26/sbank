import { supabase } from "./supabase";
import type {
  Asset,
  AssetWithOwner,
  Employee,
  Department,
  Branch,
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
  AssetIntelligence,
  AssetStatus,
  AuditActionType,
} from "@/types";
import {
  calculateAssetIntelligenceFromData,
  computeBranchRiskComparison,
} from "@/lib/analytics";
import { isValidTransition, getStatusErrorMessage } from "@/lib/lifecycle";

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

// ============ DEPARTMENTS & BRANCHES ============
export async function getAllDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAllBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("name", { ascending: true });

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
  const employeeIds = Array.from(
    new Set(
      assets
        .filter(
          (a) => a.current_owner_id && a.current_owner_type === "employee",
        )
        .map((a) => a.current_owner_id as string),
    ),
  );

  const departmentIds = Array.from(
    new Set(
      assets
        .filter(
          (a) => a.current_owner_id && a.current_owner_type === "department",
        )
        .map((a) => a.current_owner_id as string),
    ),
  );

  const branchIds = Array.from(
    new Set(
      assets
        .filter((a) => a.current_owner_id && a.current_owner_type === "branch")
        .map((a) => a.current_owner_id as string),
    ),
  );

  let employeesMap: Record<string, Employee> = {};
  let departmentsMap: Record<string, Department> = {};
  let branchesMap: Record<string, Branch> = {};

  if (employeeIds.length > 0) {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .in("id", employeeIds);
    if (data)
      employeesMap = data.reduce(
        (acc, emp) => {
          acc[emp.id] = emp;
          return acc;
        },
        {} as Record<string, Employee>,
      );
  }

  if (departmentIds.length > 0) {
    const { data } = await supabase
      .from("departments")
      .select("*")
      .in("id", departmentIds);
    if (data)
      departmentsMap = data.reduce(
        (acc, dep) => {
          acc[dep.id] = dep;
          return acc;
        },
        {} as Record<string, Department>,
      );
  }

  if (branchIds.length > 0) {
    const { data } = await supabase
      .from("branches")
      .select("*")
      .in("id", branchIds);
    if (data)
      branchesMap = data.reduce(
        (acc, br) => {
          acc[br.id] = br;
          return acc;
        },
        {} as Record<string, Branch>,
      );
  }

  // Map owner details
  return assets.map((asset) => {
    if (!asset.current_owner_id) return asset;

    let dummyOwner: Employee | undefined = undefined;

    if (asset.current_owner_type === "employee") {
      dummyOwner = employeesMap[asset.current_owner_id];
    } else if (asset.current_owner_type === "department") {
      const dep = departmentsMap[asset.current_owner_id];
      if (dep) {
        dummyOwner = {
          id: dep.id,
          first_name: dep.name,
          last_name: "(Dept)",
          email: "",
          department: dep.name,
          branch: "",
          created_at: dep.created_at,
          updated_at: dep.created_at,
        };
      }
    } else if (asset.current_owner_type === "branch") {
      const br = branchesMap[asset.current_owner_id];
      if (br) {
        dummyOwner = {
          id: br.id,
          first_name: br.name,
          last_name: "(Branch)",
          email: "",
          department: "",
          branch: br.name,
          created_at: br.created_at,
          updated_at: br.created_at,
        };
      }
    }

    return {
      ...asset,
      owner: dummyOwner,
    };
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

  // Fetch owner details correctly for all types
  if (data.current_owner_id) {
    if (data.current_owner_type === "employee") {
      const owner = await getEmployeeById(data.current_owner_id);
      return { ...data, owner: owner || undefined };
    } else if (data.current_owner_type === "department") {
      const { data: dep } = await supabase
        .from("departments")
        .select("*")
        .eq("id", data.current_owner_id)
        .maybeSingle();
      if (dep)
        return {
          ...data,
          owner: {
            id: dep.id,
            first_name: dep.name,
            last_name: "(Dept)",
            email: "",
            department: dep.name,
            branch: "",
            created_at: dep.created_at,
            updated_at: dep.created_at,
          },
        };
    } else if (data.current_owner_type === "branch") {
      const { data: br } = await supabase
        .from("branches")
        .select("*")
        .eq("id", data.current_owner_id)
        .maybeSingle();
      if (br)
        return {
          ...data,
          owner: {
            id: br.id,
            first_name: br.name,
            last_name: "(Branch)",
            email: "",
            department: "",
            branch: br.name,
            created_at: br.created_at,
            updated_at: br.created_at,
          },
        };
    }
  }

  return data;
}

export async function getPublicAssetData(id: string): Promise<{
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
} | null> {
  const asset = await getAssetById(id);
  if (!asset) return null;

  let ownerName: string | null = null;
  if (asset.current_owner_id) {
    if (asset.owner) {
      ownerName = `${asset.owner.first_name} ${asset.owner.last_name}`;
    } else {
      ownerName = asset.current_owner_id; // Fallback for raw IDs if name resolution fails
    }
  }

  return {
    name: asset.name,
    serial_number: asset.serial_number,
    category: asset.category,
    status: asset.status,
    image_url: asset.image_url,
    branch: asset.branch,
    department: asset.department,
    asset_type: asset.asset_type,
    owner_display_name: ownerName,
    created_at: asset.created_at,
    last_verified_at: asset.last_verified_at,
  };
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const { data, error } = await supabase
    .from("assets")
    .insert({
      ...input,
      status: input.current_owner_id ? "ASSIGNED" : "REGISTERED",
    })
    .select()
    .single();

  if (error) throw error;

  // Update QR code data using asset UUID for production security
  const qrCodeData = `${window.location.origin}/asset/public/${data.id}`;
  await supabase
    .from("assets")
    .update({ qr_code_data: qrCodeData })
    .eq("id", data.id);

  data.qr_code_data = qrCodeData;

  // If created with an owner, write assignment history and initial status
  if (input.current_owner_id && input.current_owner_type) {
    let ownerName = "Unknown";
    if (input.current_owner_type === "employee") {
      const emp = await getEmployeeById(input.current_owner_id);
      if (emp) ownerName = `${emp.first_name} ${emp.last_name}`;
    } else if (input.current_owner_type === "department") {
      const { data: dep } = await supabase
        .from("departments")
        .select("name")
        .eq("id", input.current_owner_id)
        .single();
      if (dep) ownerName = dep.name;
    } else if (input.current_owner_type === "branch") {
      const { data: br } = await supabase
        .from("branches")
        .select("name")
        .eq("id", input.current_owner_id)
        .single();
      if (br) ownerName = br.name;
    }
    await assignAsset({
      asset_id: data.id,
      owner_id: input.current_owner_id,
      owner_type: input.current_owner_type,
      owner_name: ownerName,
      reason: "Initial assignment on creation",
    });
  } else {
    // Create initial generic history
    await createStatusHistory({
      asset_id: data.id,
      previous_status: null,
      new_status: "REGISTERED",
      reason: "Initial registration",
    });
  }

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

  // Validate status: LOST or WRITTEN_OFF assets cannot be assigned
  if (asset.status === "LOST" || asset.status === "WRITTEN_OFF") {
    throw new Error(`Cannot assign asset in ${asset.status} state.`);
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

  // Create status history: status moves to REGISTERED
  await createStatusHistory({
    asset_id: data.id,
    previous_status: asset.status,
    new_status: "REGISTERED",
    reason: `Asset returned: ${reason}`,
  });

  return data;
}

export async function changeAssetStatus(
  input: ChangeStatusInput,
): Promise<Asset> {
  const asset = await getAssetById(input.asset_id);
  if (!asset) throw new Error("Asset not found");

  // Validate status transitions using lifecycle helper
  if (!isValidTransition(asset.status, input.new_status)) {
    throw new Error(getStatusErrorMessage(asset.status, input.new_status));
  }

  // Business Rule: ASSIGNED status requires an active owner
  if (input.new_status === "ASSIGNED" && !asset.current_owner_id) {
    throw new Error(
      "Asset must be assigned to an owner before setting status to ASSIGNED.",
    );
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
  allAssets: AssetWithOwner[];
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
  const suspiciousAssetsSet = new Set<string>();
  const healthMap = new Map<string, number>();

  for (const asset of assets) {
    stats.by_status[asset.status]++;
    stats.by_category[asset.category]++;

    const assetAssignments = assignmentsByAsset[asset.id] || [];
    const assetStatuses = statusesByAsset[asset.id] || [];
    const assetAuditLogs = auditLogsByAsset[asset.id] || [];

    const intel = calculateAssetIntelligenceFromData(
      asset,
      assetStatuses,
      assetAssignments,
      assetAuditLogs,
    );

    healthScores[asset.id] = intel.health.score;
    healthMap.set(asset.id, intel.health.score);
    riskScores[asset.id] = intel.risk.score;

    // Analytics gathered via intel

    if (intel.is_aging) {
      stats.aging_assets++;
      agingAssets.push(asset);
      agingIds.add(asset.id);
    }
    if (intel.risk.level === "High" || intel.risk.score >= 10) {
      stats.risky_assets++;
      riskyAssets.push(asset);
      riskyIds.add(asset.id);
    }
    if (intel.is_suspicious) {
      stats.suspicious_assets++;
      suspiciousAssets.push(asset);
      suspiciousAssetsSet.add(asset.id);
    }

    // A unified "problematic" check or just include those with warnings
    if (
      (intel.health.level !== "Healthy" || intel.risk.level !== "Low") &&
      !intel.is_aging
    ) {
      problematicAssets.push(asset);
    }
  }

  // Branch risk comparison using unified helper
  const branchComparison = computeBranchRiskComparison(
    assets,
    riskyIds,
    agingIds,
    healthMap,
  );

  return {
    stats,
    allAssets: assets, // Added for frontend filtering
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

  return calculateAssetIntelligenceFromData(
    asset,
    statusHistory,
    assignmentHistory,
    auditLogs,
  );
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
