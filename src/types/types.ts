// Enums
export type UserRole = 'employee' | 'asset_manager' | 'admin';
export type AssetStatus = 'REGISTERED' | 'ASSIGNED' | 'IN_REPAIR' | 'LOST' | 'WRITTEN_OFF';
export type AssetCategory = 'IT' | 'OFFICE' | 'SECURITY' | 'NETWORK' | 'OTHER';
export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'RETURN' | 'STATUS_CHANGE' | 'REPAIR' | 'VERIFY';
export type OwnerType = 'employee' | 'department' | 'branch';

// Profile
export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  branch: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Employee
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  branch: string;
  created_at: string;
  updated_at: string;
}

// Asset
export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  category: AssetCategory;
  serial_number: string;
  image_url: string | null;
  purchase_date: string;
  branch: string;
  department: string;
  status: AssetStatus;
  current_owner_id: string | null;
  current_owner_type: OwnerType | null;
  qr_code_data: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Asset with owner details
export interface AssetWithOwner extends Asset {
  owner?: Employee;
}

// Asset Assignment History
export interface AssetAssignmentHistory {
  id: string;
  asset_id: string;
  owner_id: string;
  owner_type: OwnerType;
  owner_name: string;
  assigned_at: string;
  returned_at: string | null;
  status_during_assignment: AssetStatus;
  reason: string | null;
  assigned_by: string | null;
  created_at: string;
}

// Asset Status History
export interface AssetStatusHistory {
  id: string;
  asset_id: string;
  previous_status: AssetStatus | null;
  new_status: AssetStatus;
  reason: string | null;
  changed_by: string | null;
  changed_at: string;
  created_at: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action_type: AuditActionType;
  user_id: string | null;
  user_name: string | null;
  previous_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_assets: number;
  by_status: Record<AssetStatus, number>;
  by_category: Record<AssetCategory, number>;
  aging_assets: number;
  risky_assets: number;
  suspicious_assets: number;
}

// Asset Health Score
export interface AssetHealthScore {
  score: number;
  level: 'Healthy' | 'Warning' | 'Critical';
  factors: {
    age_penalty: number;
    repair_penalty: number;
    owner_change_penalty: number;
    audit_issue_penalty: number;
    verification_penalty: number;
    status_penalty: number;
  };
}

// Asset Risk Score
export interface AssetRiskScore {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: {
    age_factor: number;
    repair_factor: number;
    instability_factor: number;
    audit_factor: number;
    comment_issue_factor: number;
    missing_verification_factor: number;
  };
}

// Asset Intelligence
export interface AssetIntelligence {
  health: AssetHealthScore;
  risk: AssetRiskScore;
  replacement_recommended: boolean;
  is_aging: boolean;
  is_suspicious: boolean;
  suspicious_reasons: string[];
}

// Form types
export interface CreateAssetInput {
  name: string;
  asset_type: string;
  category: AssetCategory;
  serial_number: string;
  image_url?: string;
  purchase_date: string;
  branch: string;
  department: string;
}

export interface AssignAssetInput {
  asset_id: string;
  owner_id: string;
  owner_type: OwnerType;
  owner_name: string;
  reason: string;
}

export interface ChangeStatusInput {
  asset_id: string;
  new_status: AssetStatus;
  reason: string;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  branch: string;
}

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  department?: string;
  branch?: string;
  role?: UserRole;
}
