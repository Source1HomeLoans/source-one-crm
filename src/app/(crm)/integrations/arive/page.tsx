import { AriveTestButton } from "@/components/integrations/arive-test-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnvironmentStatus } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function AriveIntegrationSettingsPage() {
  const env = getEnvironmentStatus();
  const settings = [
    { label: "ARIVE integration enabled", value: env.ariveIntegrationEnabled ? "Yes" : "No", ok: env.ariveIntegrationEnabled },
    { label: "Zapier webhook URL", value: env.ariveZapierWebhookUrl ? "Configured" : "Missing", ok: env.ariveZapierWebhookUrl },
    { label: "Zapier API key", value: env.ariveZapierApiKey ? "Configured" : "Optional / missing", ok: true },
    { label: "Default ARIVE LO mapping", value: env.ariveDefaultLoanOfficerMapping ? "Configured" : "Optional / missing", ok: true }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Badge tone="blue">Integration</Badge>
        <h1 className="mt-3 text-2xl font-semibold text-brand-ink">ARIVE Integration Settings</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Source One CRM manages lead intake and follow-up. ARIVE remains the LOS source of truth after a qualified borrower is sent.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-ink">{setting.label}</p>
                  <p className="break-words text-xs text-slate-500">{setting.value}</p>
                </div>
                <Badge tone={setting.ok ? "green" : "red"}>{setting.ok ? "Ready" : "Needs setup"}</Badge>
              </div>
            ))}
            <AriveTestButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <Row label="Enabled" value="ARIVE_INTEGRATION_ENABLED=true" />
              <Row label="Webhook URL" value="ARIVE_ZAPIER_WEBHOOK_URL" />
              <Row label="API key" value="ARIVE_ZAPIER_API_KEY" />
              <Row label="LO mapping" value="ARIVE_DEFAULT_LOAN_OFFICER_MAPPING" />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[65%] break-words text-right font-semibold text-brand-ink">{value}</dd>
    </div>
  );
}
