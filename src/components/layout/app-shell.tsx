import { Bell, Search } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/nav";
import type { UserProfile } from "@/lib/supabase/server";

type AppShellProps = {
  profile: UserProfile;
  children: React.ReactNode;
};

export function AppShell({ profile, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Source One Home Loans</p>
            <h1 className="truncate text-lg font-semibold text-brand-ink">Mortgage CRM</h1>
          </div>
          <div className="hidden max-w-xl flex-1 items-center rounded-md border border-slate-200 bg-slate-50 px-3 md:flex">
            <Search size={17} className="text-slate-400" />
            <input
              className="h-10 flex-1 bg-transparent px-3 text-sm outline-none"
              placeholder="Search leads, borrowers, loans, partners"
              aria-label="Search CRM"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-10 w-10 px-0" aria-label="Notifications">
              <Bell size={18} />
            </Button>
            <LogoutButton />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-brand-ink">{profile.full_name}</p>
              <p className="text-xs capitalize text-slate-500">{profile.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 lg:hidden">
          <SidebarNav role={profile.role} />
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-slate-200 bg-white lg:block">
          <SidebarNav role={profile.role} />
        </aside>
        <main className="px-4 py-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
