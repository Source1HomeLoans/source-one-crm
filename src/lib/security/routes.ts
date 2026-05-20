import { can, type AppRole, type Permission } from "@/lib/security/permissions";

const routePermissions: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/dashboard", permission: "dashboard:view" },
  { prefix: "/leads", permission: "leads:manage" },
  { prefix: "/shark-tank", permission: "leads:manage" },
  { prefix: "/dnc-hold", permission: "leads:manage" },
  { prefix: "/borrowers", permission: "borrowers:manage" },
  { prefix: "/pipeline", permission: "loans:manage" },
  { prefix: "/partners", permission: "partners:manage" },
  { prefix: "/campaigns", permission: "campaigns:manage" },
  { prefix: "/tasks", permission: "tasks:manage" },
  { prefix: "/notes", permission: "notes:manage" },
  { prefix: "/activity", permission: "activity:view" },
  { prefix: "/files", permission: "documents:view" },
  { prefix: "/export", permission: "data:export" },
  { prefix: "/compliance", permission: "compliance:view" },
  { prefix: "/documents", permission: "documents:view" },
  { prefix: "/programs", permission: "programs:manage" },
  { prefix: "/audit-logs", permission: "audit:view" },
  { prefix: "/admin", permission: "admin:manage" }
];

export function getRoutePermission(pathname: string) {
  return routePermissions.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`))?.permission;
}

export function canAccessRoute(role: AppRole, pathname: string) {
  const permission = getRoutePermission(pathname);
  return permission ? can(role, permission) : true;
}
