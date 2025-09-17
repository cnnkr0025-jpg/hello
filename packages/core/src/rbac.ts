import type { Role } from "./types";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  USER: [
    "jobs:create",
    "jobs:read",
    "presets:use",
    "projects:read",
  ],
  ADMIN: [
    "jobs:create",
    "jobs:read",
    "jobs:retry",
    "presets:manage",
    "projects:manage",
    "users:manage",
    "providers:manage",
    "usage:read",
  ],
};

export const hasPermission = (role: Role, permission: string) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission) || role === "ADMIN";
};
