import { Bell, Search, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-brand-gold/20 bg-white/95 backdrop-blur">
        <div className="flex h-16 max-w-full items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-navy text-brand-gold shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Source One Home Loans</p>
              <h1 className="truncate text-lg font-semibold tracking-tight text-brand-navy">Mortgage CRM</h1>
            </div>
          </div>
          <div className="hidden min-w-0 max-w-xl flex-1 items-center rounded-md border border-slate-200 bg-white px-3 shadow-sm md:flex">
            <Search size={17} className="text-slate-400" />
            <input
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              placeholder="Search leads, borrowers, loans, partners"
              aria-label="Search CRM"
            />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" className="h-10 w-10 px-0" aria-label="Notifications">
              <Bell size={18} />
            </Button>
            <LogoutButton />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-brand-navy">{profile.full_name}</p>
              <p className="text-xs capitalize text-slate-500">{profile.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-brand-gold/15 bg-brand-dark lg:hidden">
          <SidebarNav role={profile.role} />
        </div>
      </header>
      <div className="max-w-full overflow-x-hidden lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-brand-gold/20 bg-brand-dark lg:block">
          <div className="border-b border-white/10 p-4">
            <div className="rounded-lg border border-brand-gold/20 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-lightGold">Luxury Lending Desk</p>
              <p className="mt-1 text-sm text-slate-200">Lead flow, follow-up, and ARIVE handoff.</p>
            </div>
          </div>
          <SidebarNav role={profile.role} />
        </aside>
        <main className="min-w-0 max-w-full overflow-x-hidden px-4 py-5 lg:px-7 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
