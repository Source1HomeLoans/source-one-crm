import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnvironmentStatus } from "@/lib/env";

export default function AdminPage() {
  const env = getEnvironmentStatus();
  const settings = [
    { label: "Company", value: "Source One Home Loans", scope: "Global" },
    { label: "Default timezone", value: "America/Phoenix", scope: "Global" },
    { label: "Lead SLA", value: "15 minutes", scope: "Sales" },
    { label: "SMS opt-out footer", value: "Reply STOP to opt out", scope: "Compliance" }
  ];
  const checks = [
    { label: "Supabase URL", ok: env.supabaseUrl },
    { label: "Supabase anon key", ok: env.supabaseAnonKey },
    { label: "Service role key", ok: env.serviceRoleKey },
    { label: "Site URL", ok: env.siteUrl },
    { label: "Storage bucket", ok: Boolean(env.documentBucket), value: env.documentBucket }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Badge>RBAC</Badge>
        <h1 className="mt-3 text-2xl font-semibold text-brand-ink">Admin Settings</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">Manage users, roles, compliance settings, environment readiness, lead SLA targets, and permission overrides.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operational Settings</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Setting</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settings.map((setting) => (
                  <tr key={setting.label}>
                    <td className="px-4 py-3 font-medium text-brand-ink">{setting.label}</td>
                    <td className="px-4 py-3 text-slate-600">{setting.value}</td>
                    <td className="px-4 py-3 text-slate-600">{setting.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-brand-ink">{check.label}</p>
                  {check.value ? <p className="text-xs text-slate-500">{check.value}</p> : null}
                </div>
                <Badge tone={check.ok ? "green" : "gold"}>{check.ok ? "Set" : "Missing"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
