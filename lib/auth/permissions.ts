import { UserRole } from "@/types/auth";

export type Permission =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "officials.view"
  | "officials.create"
  | "officials.edit"
  | "officials.delete"
  | "requests.view"
  | "requests.create"
  | "requests.edit"
  | "requests.delete"
  | "disasters.view"
  | "disasters.create"
  | "disasters.edit"
  | "disasters.delete"
  | "reports.view"
  | "reports.create"
  | "map.view"
  | "configuration.view";

const permissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",

    "officials.view",
    "officials.create",
    "officials.edit",
    "officials.delete",

    "requests.view",
    "requests.create",
    "requests.edit",
    "requests.delete",

    "disasters.view",
    "disasters.create",
    "disasters.edit",
    "disasters.delete",

    "reports.view",
    "reports.create",

    "map.view",

    "configuration.view",
  ],

  FUNCIONARIO: [
    "users.view",

    "requests.view",
    "requests.create",
    "requests.edit",

    "disasters.view",

    "reports.view",

    "map.view",
  ],

  USUARIO: ["requests.view", "requests.create", "map.view"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return permissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole) {
  return permissions[role] ?? [];
}
