import type { Role } from "@prisma/client";

export const STAFF_INVITE_ROLES = ["EMPLOYEE"] as const;
export type StaffInviteRole = (typeof STAFF_INVITE_ROLES)[number];

export function isStaffInviteRole(v: string): v is StaffInviteRole {
  return v === "EMPLOYEE";
}

export function staffRoleLabel(role: Role | StaffInviteRole): string {
  if (role === "EMPLOYEE") return "Employé";
  if (role === "OWNER") return "Gérant";
  return "Administrateur";
}
