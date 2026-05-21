export const documentBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "borrower-documents";
export const ariveIntegrationEnabled = process.env.ARIVE_INTEGRATION_ENABLED === "true";
export const ariveZapierWebhookUrl = process.env.ARIVE_ZAPIER_WEBHOOK_URL;
export const ariveZapierApiKey = process.env.ARIVE_ZAPIER_API_KEY;
export const ariveDefaultLoanOfficerMapping = process.env.ARIVE_DEFAULT_LOAN_OFFICER_MAPPING;

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getEnvironmentStatus() {
  return {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    documentBucket,
    ariveIntegrationEnabled,
    ariveZapierWebhookUrl: Boolean(ariveZapierWebhookUrl),
    ariveZapierApiKey: Boolean(ariveZapierApiKey),
    ariveDefaultLoanOfficerMapping: Boolean(ariveDefaultLoanOfficerMapping)
  };
}
