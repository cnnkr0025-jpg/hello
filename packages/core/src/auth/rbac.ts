export type Role = "USER" | "ADMIN";

export interface Permission {
  resource: string;
  action: "read" | "write" | "delete" | "manage";
}

const roleMatrix: Record<Role, Permission[]> = {
  USER: [
    { resource: "jobs", action: "read" },
    { resource: "jobs", action: "write" },
    { resource: "projects", action: "read" },
  ],
  ADMIN: [
    { resource: "jobs", action: "manage" },
    { resource: "projects", action: "manage" },
    { resource: "users", action: "manage" },
    { resource: "providers", action: "manage" },
    { resource: "billing", action: "manage" },
  ],
};

export function hasPermission(role: Role, resource: string, action: Permission["action"]): boolean {
  const permissions = roleMatrix[role] ?? [];
  if (permissions.some((perm) => perm.action === "manage" && perm.resource === resource)) {
    return true;
  }
  return permissions.some((perm) => perm.resource === resource && perm.action === action);
}

export function assertPermission(role: Role, resource: string, action: Permission["action"]): void {
  if (!hasPermission(role, resource, action)) {
    throw new Error(`Role ${role} is not allowed to ${action} ${resource}`);
  }
}
