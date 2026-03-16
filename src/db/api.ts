import { supabase } from './supabase';
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
} from '@/types';

// ============ PROFILES ============
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateProfile(id: string, input: UpdateProfileInput): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ EMPLOYEES ============
export async function getAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'employee',
    entity_id: data.id,
    action_type: 'CREATE',
    new_state: data,
    reason: 'Employee created',
  });

  return data;
}

export async function updateEmployee(id: string, input: Partial<CreateEmployeeInput>): Promise<Employee> {
  const previous = await getEmployeeById(id);

  const { data, error } = await supabase
    .from('employees')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'employee',
    entity_id: data.id,
    action_type: 'UPDATE',
    previous_state: previous,
    new_state: data,
    reason: 'Employee updated',
  });

  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  const previous = await getEmployeeById(id);

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'employee',
    entity_id: id,
    action_type: 'DELETE',
    previous_state: previous,
    reason: 'Employee deleted',
  });
}

// ============ ASSETS ============
export async function getAllAssets(): Promise<AssetWithOwner[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const assets = Array.isArray(data) ? data : [];

  // Fetch owner details for assets with owners
  const assetsWithOwners = await Promise.all(
    assets.map(async (asset) => {
      if (asset.current_owner_id && asset.current_owner_type === 'employee') {
        const owner = await getEmployeeById(asset.current_owner_id);
        return { ...asset, owner: owner || undefined };
      }
      return asset;
    })
  );

  return assetsWithOwners;
}

export async function getAssetById(id: string): Promise<AssetWithOwner | null> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Fetch owner details
  if (data.current_owner_id && data.current_owner_type === 'employee') {
    const owner = await getEmployeeById(data.current_owner_id);
    return { ...data, owner: owner || undefined };
  }

  return data;
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  // Generate QR code data
  const qrCodeData = `ASSET-${input.serial_number}`;

  const { data, error } = await supabase
    .from('assets')
    .insert({ ...input, qr_code_data: qrCodeData })
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'asset',
    entity_id: data.id,
    action_type: 'CREATE',
    new_state: data,
    reason: 'Asset created',
  });

  // Create status history
  await createStatusHistory({
    asset_id: data.id,
    previous_status: null,
    new_status: 'REGISTERED',
    reason: 'Initial registration',
  });

  return data;
}

export async function updateAsset(id: string, input: Partial<CreateAssetInput>): Promise<Asset> {
  const previous = await getAssetById(id);

  const { data, error } = await supabase
    .from('assets')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'asset',
    entity_id: data.id,
    action_type: 'UPDATE',
    previous_state: previous,
    new_state: data,
    reason: 'Asset updated',
  });

  return data;
}

export async function assignAsset(input: AssignAssetInput): Promise<Asset> {
  const asset = await getAssetById(input.asset_id);
  if (!asset) throw new Error('Asset not found');

  // Validate status
  if (asset.status === 'LOST') {
    throw new Error('Cannot assign LOST assets');
  }
  if (asset.status === 'WRITTEN_OFF') {
    throw new Error('Cannot assign WRITTEN_OFF assets');
  }
  if (asset.status === 'IN_REPAIR') {
    throw new Error('Cannot assign assets that are IN_REPAIR');
  }

  // Close previous assignment if exists
  if (asset.current_owner_id) {
    await supabase
      .from('asset_assignment_history')
      .update({ returned_at: new Date().toISOString() })
      .eq('asset_id', input.asset_id)
      .is('returned_at', null);
  }

  // Update asset
  const { data, error } = await supabase
    .from('assets')
    .update({
      current_owner_id: input.owner_id,
      current_owner_type: input.owner_type,
      status: 'ASSIGNED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.asset_id)
    .select()
    .single();

  if (error) throw error;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Create assignment history
  await supabase
    .from('asset_assignment_history')
    .insert({
      asset_id: input.asset_id,
      owner_id: input.owner_id,
      owner_type: input.owner_type,
      owner_name: input.owner_name,
      status_during_assignment: 'ASSIGNED',
      reason: input.reason,
      assigned_by: user?.id,
    });

  // Create audit log
  await createAuditLog({
    entity_type: 'asset',
    entity_id: data.id,
    action_type: 'ASSIGN',
    previous_state: asset,
    new_state: data,
    reason: input.reason,
  });

  // Create status history if status changed
  if (asset.status !== 'ASSIGNED') {
    await createStatusHistory({
      asset_id: data.id,
      previous_status: asset.status,
      new_status: 'ASSIGNED',
      reason: input.reason,
    });
  }

  return data;
}

export async function returnAsset(assetId: string, reason: string): Promise<Asset> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');

  // Close current assignment
  await supabase
    .from('asset_assignment_history')
    .update({ returned_at: new Date().toISOString() })
    .eq('asset_id', assetId)
    .is('returned_at', null);

  // Update asset
  const { data, error } = await supabase
    .from('assets')
    .update({
      current_owner_id: null,
      current_owner_type: null,
      status: 'REGISTERED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', assetId)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'asset',
    entity_id: data.id,
    action_type: 'RETURN',
    previous_state: asset,
    new_state: data,
    reason,
  });

  // Create status history
  await createStatusHistory({
    asset_id: data.id,
    previous_status: asset.status,
    new_status: 'REGISTERED',
    reason,
  });

  return data;
}

export async function changeAssetStatus(input: ChangeStatusInput): Promise<Asset> {
  const asset = await getAssetById(input.asset_id);
  if (!asset) throw new Error('Asset not found');

  // Validate status transitions
  if (asset.status === 'WRITTEN_OFF') {
    throw new Error('Cannot change status of WRITTEN_OFF assets');
  }

  const { data, error } = await supabase
    .from('assets')
    .update({
      status: input.new_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.asset_id)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'asset',
    entity_id: data.id,
    action_type: 'STATUS_CHANGE',
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
    .from('assets')
    .update({
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', assetId)
    .select()
    .single();

  if (error) throw error;

  // Create audit log
  await createAuditLog({
    entity_type: 'asset',
    entity_id: data.id,
    action_type: 'VERIFY',
    new_state: data,
    reason: 'Asset verified',
  });

  return data;
}

// ============ ASSIGNMENT HISTORY ============
export async function getAssetAssignmentHistory(assetId: string): Promise<AssetAssignmentHistory[]> {
  const { data, error } = await supabase
    .from('asset_assignment_history')
    .select('*')
    .eq('asset_id', assetId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ============ STATUS HISTORY ============
export async function getAssetStatusHistory(assetId: string): Promise<AssetStatusHistory[]> {
  const { data, error } = await supabase
    .from('asset_status_history')
    .select('*')
    .eq('asset_id', assetId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function createStatusHistory(input: {
  asset_id: string;
  previous_status: AssetStatus | null;
  new_status: AssetStatus;
  reason: string | null;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase
    .from('asset_status_history')
    .insert({
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
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }
  if (filters?.entity_id) {
    query = query.eq('entity_id', filters.entity_id);
  }
  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters?.action_type) {
    query = query.eq('action_type', filters.action_type);
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
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, first_name, last_name')
    .eq('id', user?.id || '')
    .maybeSingle();

  const userName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.username || 'System';

  await supabase
    .from('audit_logs')
    .insert({
      ...input,
      user_id: user?.id,
      user_name: userName,
      previous_state: input.previous_state as never,
      new_state: input.new_state as never,
    });
}

// ============ DASHBOARD STATS ============
export async function getDashboardStats(): Promise<DashboardStats> {
  const assets = await getAllAssets();

  const stats: DashboardStats = {
    total_assets: assets.length,
    by_status: {
      REGISTERED: 0,
      ASSIGNED: 0,
      IN_REPAIR: 0,
      LOST: 0,
      WRITTEN_OFF: 0,
    },
    by_category: {
      IT: 0,
      OFFICE: 0,
      SECURITY: 0,
      NETWORK: 0,
      OTHER: 0,
    },
    aging_assets: 0,
    risky_assets: 0,
    suspicious_assets: 0,
  };

  for (const asset of assets) {
    stats.by_status[asset.status]++;
    stats.by_category[asset.category]++;

    const intelligence = await calculateAssetIntelligence(asset.id);
    if (intelligence.is_aging) stats.aging_assets++;
    if (intelligence.risk.level === 'High') stats.risky_assets++;
    if (intelligence.is_suspicious) stats.suspicious_assets++;
  }

  return stats;
}

// ============ INTELLIGENCE CALCULATIONS ============
export async function calculateAssetHealthScore(assetId: string): Promise<AssetHealthScore> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');

  const assignmentHistory = await getAssetAssignmentHistory(assetId);
  const statusHistory = await getAssetStatusHistory(assetId);
  const auditLogs = await getAuditLogs({ entity_id: assetId });

  // Calculate age in years
  const purchaseDate = new Date(asset.purchase_date);
  const now = new Date();
  const ageYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Count repairs
  const repairCount = statusHistory.filter(h => h.new_status === 'IN_REPAIR').length;

  // Count owner changes
  const ownerChangeCount = assignmentHistory.length;

  // Count audit issues (status changes to LOST, IN_REPAIR, etc.)
  const auditIssueCount = statusHistory.filter(
    h => h.new_status === 'LOST' || h.new_status === 'IN_REPAIR'
  ).length;

  // Days since last verification
  const daysSinceVerification = asset.last_verified_at
    ? (now.getTime() - new Date(asset.last_verified_at).getTime()) / (1000 * 60 * 60 * 24)
    : 365;

  // Calculate penalties
  const agePenalty = ageYears * 8;
  const repairPenalty = repairCount * 12;
  const ownerChangePenalty = ownerChangeCount * 4;
  const auditIssuePenalty = auditIssueCount * 10;
  const verificationPenalty = (daysSinceVerification / 30) * 3;

  let statusPenalty = 0;
  if (asset.status === 'IN_REPAIR') statusPenalty = 20;
  if (asset.status === 'LOST') statusPenalty = 50;
  if (asset.status === 'WRITTEN_OFF') statusPenalty = 100;

  // Calculate score
  let score = 100 - agePenalty - repairPenalty - ownerChangePenalty - auditIssuePenalty - verificationPenalty - statusPenalty;
  score = Math.max(0, Math.min(100, score));

  // Determine level
  let level: 'Healthy' | 'Warning' | 'Critical';
  if (score >= 80) level = 'Healthy';
  else if (score >= 50) level = 'Warning';
  else level = 'Critical';

  return {
    score: Math.round(score),
    level,
    factors: {
      age_penalty: Math.round(agePenalty),
      repair_penalty: Math.round(repairPenalty),
      owner_change_penalty: Math.round(ownerChangePenalty),
      audit_issue_penalty: Math.round(auditIssuePenalty),
      verification_penalty: Math.round(verificationPenalty),
      status_penalty: statusPenalty,
    },
  };
}

export async function calculateAssetRiskScore(assetId: string): Promise<AssetRiskScore> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');

  const assignmentHistory = await getAssetAssignmentHistory(assetId);
  const statusHistory = await getAssetStatusHistory(assetId);
  const auditLogs = await getAuditLogs({ entity_id: assetId });

  // Calculate age in years
  const purchaseDate = new Date(asset.purchase_date);
  const now = new Date();
  const ageYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Count repairs
  const repairCount = statusHistory.filter(h => h.new_status === 'IN_REPAIR').length;

  // Count owner changes
  const ownerChangeCount = assignmentHistory.length;

  // Count audit issues
  const auditIssueCount = statusHistory.filter(
    h => h.new_status === 'LOST' || h.new_status === 'IN_REPAIR'
  ).length;

  // Check for comment issues
  const commentIssueKeywords = ['broken', 'damaged', 'faulty', 'malfunction', 'error', 'problem', 'issue', 'defect'];
  const commentIssueCount = auditLogs.filter(log =>
    log.reason && commentIssueKeywords.some(keyword => log.reason!.toLowerCase().includes(keyword))
  ).length;

  // Days since last verification
  const daysSinceVerification = asset.last_verified_at
    ? (now.getTime() - new Date(asset.last_verified_at).getTime()) / (1000 * 60 * 60 * 24)
    : 365;

  // Calculate factors
  const ageFactor = ageYears > 5 ? 20 : ageYears > 3 ? 10 : 0;
  const repairFactor = repairCount >= 3 ? 25 : repairCount === 2 ? 15 : repairCount === 1 ? 5 : 0;
  const instabilityFactor = ownerChangeCount >= 4 ? 15 : ownerChangeCount >= 2 ? 8 : 0;
  const auditFactor = auditIssueCount >= 2 ? 20 : auditIssueCount === 1 ? 10 : 0;
  const commentIssueFactor = commentIssueCount >= 2 ? 10 : 0;
  const missingVerificationFactor = daysSinceVerification > 180 ? 10 : 0;

  // Calculate score
  const score = ageFactor + repairFactor + instabilityFactor + auditFactor + commentIssueFactor + missingVerificationFactor;

  // Determine level
  let level: 'Low' | 'Medium' | 'High';
  if (score <= 30) level = 'Low';
  else if (score <= 60) level = 'Medium';
  else level = 'High';

  return {
    score,
    level,
    factors: {
      age_factor: ageFactor,
      repair_factor: repairFactor,
      instability_factor: instabilityFactor,
      audit_factor: auditFactor,
      comment_issue_factor: commentIssueFactor,
      missing_verification_factor: missingVerificationFactor,
    },
  };
}

export async function calculateAssetIntelligence(assetId: string): Promise<AssetIntelligence> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');

  const health = await calculateAssetHealthScore(assetId);
  const risk = await calculateAssetRiskScore(assetId);
  const assignmentHistory = await getAssetAssignmentHistory(assetId);
  const statusHistory = await getAssetStatusHistory(assetId);

  // Calculate age in years
  const purchaseDate = new Date(asset.purchase_date);
  const now = new Date();
  const ageYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  // Count repairs
  const repairCount = statusHistory.filter(h => h.new_status === 'IN_REPAIR').length;

  // Replacement recommendation
  const replacementRecommended =
    health.score < 40 ||
    (ageYears > 5 && repairCount >= 3) ||
    risk.score > 70;

  // Aging asset detection
  const isAging = ageYears > 3 && health.score < 60 && repairCount >= 2;

  // Suspicious asset detection
  const suspiciousReasons: string[] = [];

  if (asset.status === 'ASSIGNED' && !asset.current_owner_id) {
    suspiciousReasons.push('Asset marked ASSIGNED but no active owner exists');
  }

  if (asset.status === 'LOST') {
    const laterAssignments = assignmentHistory.filter(
      h => new Date(h.assigned_at) > new Date(statusHistory.find(s => s.new_status === 'LOST')?.changed_at || 0)
    );
    if (laterAssignments.length > 0) {
      suspiciousReasons.push('Asset marked LOST but later reassigned');
    }
  }

  if (assignmentHistory.length >= 5) {
    const recentChanges = assignmentHistory.filter(
      h => new Date(h.assigned_at) > new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    );
    if (recentChanges.length >= 3) {
      suspiciousReasons.push('Asset changed owners unusually often in short period');
    }
  }

  if (!asset.last_verified_at || (now.getTime() - new Date(asset.last_verified_at).getTime()) / (1000 * 60 * 60 * 24) > 365) {
    suspiciousReasons.push('Asset not verified during active audit cycle');
  }

  return {
    health,
    risk,
    replacement_recommended: replacementRecommended,
    is_aging: isAging,
    is_suspicious: suspiciousReasons.length > 0,
    suspicious_reasons: suspiciousReasons,
  };
}

export async function getAgingAssets(): Promise<AssetWithOwner[]> {
  const assets = await getAllAssets();
  const agingAssets: AssetWithOwner[] = [];

  for (const asset of assets) {
    const intelligence = await calculateAssetIntelligence(asset.id);
    if (intelligence.is_aging) {
      agingAssets.push(asset);
    }
  }

  return agingAssets;
}

export async function getRiskyAssets(): Promise<AssetWithOwner[]> {
  const assets = await getAllAssets();
  const riskyAssets: AssetWithOwner[] = [];

  for (const asset of assets) {
    const intelligence = await calculateAssetIntelligence(asset.id);
    if (intelligence.risk.level === 'High') {
      riskyAssets.push(asset);
    }
  }

  return riskyAssets;
}

export async function getSuspiciousAssets(): Promise<AssetWithOwner[]> {
  const assets = await getAllAssets();
  const suspiciousAssets: AssetWithOwner[] = [];

  for (const asset of assets) {
    const intelligence = await calculateAssetIntelligence(asset.id);
    if (intelligence.is_suspicious) {
      suspiciousAssets.push(asset);
    }
  }

  return suspiciousAssets;
}
