import { AssetStatus } from "@/types";

export const VALID_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  REGISTERED: ["ASSIGNED", "IN_REPAIR", "WRITTEN_OFF"],
  ASSIGNED: ["REGISTERED", "IN_REPAIR", "LOST", "WRITTEN_OFF"],
  IN_REPAIR: ["REGISTERED", "ASSIGNED", "WRITTEN_OFF"],
  LOST: ["WRITTEN_OFF"],
  WRITTEN_OFF: [],
};

export function isValidTransition(
  current: AssetStatus,
  next: AssetStatus,
): boolean {
  if (current === next) return true;
  const allowed = VALID_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

export function getAvailableStatuses(current: AssetStatus): AssetStatus[] {
  return VALID_TRANSITIONS[current] || [];
}

export function getStatusErrorMessage(
  current: AssetStatus,
  next: AssetStatus,
): string {
  if (current === "WRITTEN_OFF") {
    return "This asset has been WRITTEN_OFF and its status cannot be changed.";
  }
  return `Cannot change status from ${current} to ${next}.`;
}
