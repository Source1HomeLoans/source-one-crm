import Link from "next/link";
import { Ban, BarChart3, Cable, ClipboardList, Download, FileUp, Handshake, Home, LayoutDashboard, Megaphone, MessageSquareText, Settings, ShieldCheck, StickyNote, Users, Waves, type LucideIcon } from "lucide-react";

import { can, type AppRole } from "@/lib/security/permissions";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Parameters<typeof can>[1];
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/leads", label: "Leads", icon: Users, permission: "leads:manage" },
  { href: "/shark-tank", label: "Shark Tank", icon: Waves, permission: "leads:manage" },
  { href: "/my-leads", label: "My Lead Queue", icon: ClipboardList, permission: "leads:manage" },
  { href: "/dnc-hold", label: "6 Month Hold", icon: Ban, permission: "leads:manage" },
  { href: "/borrowers", label: "Borrowers", icon: Home, permission: "borrowers:manage" },
  { href: "/pipeline", label: "Pipeline", icon: BarChart3, permission: "loans:manage" },
  { href: "/referral-partners", label: "Partners", icon: Handshake, permission: "partners:manage" },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone, permission: "campaigns:manage" },
  { href: "/tasks", label: "Tasks", icon: ClipboardList, permission: "tasks:manage" },
  { href: "/notes", label: "Notes", icon: StickyNote, permission: "notes:manage" },
  { href: "/activity", label: "Activity", icon: MessageSquareText, permission: "activity:view" },
  { href: "/files", label: "Files", icon: FileUp, permission: "documents:view" },
  { href: "/export", label: "Export", icon: Download, permission: "data:export" },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck, permission: "compliance:view" },
  { href: "/integrations/arive", label: "ARIVE", icon: Cable, permission: "admin:manage" },
  { href: "/admin", label: "Admin", icon: Settings, permission: "admin:manage" }
];

export function SidebarNav({ role }: { role: AppRole }) {
  const visibleItems = items.filter((item) => can(role, item.permission));

  return (
    <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible lg:p-4">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-brand-ink",
              "focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
            )}
          >
            <Icon size={18} className="text-brand-blue" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
