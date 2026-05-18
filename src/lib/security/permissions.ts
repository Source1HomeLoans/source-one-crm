export type AppRole = "admin" | "loan_officer" | "processor" | "marketing_assistant";

export type Permission =
  | "dashboard:view"
  | "leads:manage"
  | "borrowers:manage"
  | "loans:manage"
  | "partners:manage"
  | "campaigns:manage"
  | "tasks:manage"
  | "notes:manage"
  | "activity:view"
  | "documents:view"
  | "documents:manage"
  | "data:export"
  | "compliance:view"
  | "programs:manage"
  | "audit:view"
  | "admin:manage";

const rolePermissions: Record<AppRole, Permission[]> = {
  admin: [
    "dashboard:view",
    "leads:manage",
    "borrowers:manage",
    "loans:manage",
    "partners:manage",
    "campaigns:manage",
    "tasks:manage",
    "notes:manage",
    "activity:view",
    "documents:view",
    "documents:manage",
    "data:export",
    "compliance:view",
    "programs:manage",
    "audit:view",
    "admin:manage"
  ],
  loan_officer: [
    "dashboard:view",
    "leads:manage",
    "borrowers:manage",
    "loans:manage",
    "tasks:manage",
    "notes:manage",
    "activity:view",
    "documents:view"
  ],
  processor: ["dashboard:view", "borrowers:manage", "loans:manage", "tasks:manage", "notes:manage", "activity:view", "documents:view", "documents:manage"],
  marketing_assistant: ["dashboard:view", "leads:manage", "partners:manage", "campaigns:manage"]
};

export function can(role: AppRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export const defaultRole: AppRole = "loan_officer";
