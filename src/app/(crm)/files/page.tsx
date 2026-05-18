import { FileUp, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePage } from "@/components/ui/module-page";

export default function FilesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-brand-ink">File Upload Area</h2>
            <Badge tone="green">Supabase Storage</Badge>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Upload borrower documents to a private storage bucket, track review status, and preserve document access history.
          </p>
        </div>
        <Button>
          <FileUp size={17} />
          Upload File
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex gap-3">
            <LockKeyhole className="mt-1 text-brand-blue" size={20} />
            <div>
              <p className="font-semibold text-brand-ink">Private bucket</p>
              <p className="mt-1 text-sm text-slate-500">Borrower files are stored outside public access.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex gap-3">
            <ShieldCheck className="mt-1 text-brand-teal" size={20} />
            <div>
              <p className="font-semibold text-brand-ink">RLS protected</p>
              <p className="mt-1 text-sm text-slate-500">Assigned owners, admins, and processors can access authorized files.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex gap-3">
            <KeyRound className="mt-1 text-brand-gold" size={20} />
            <div>
              <p className="font-semibold text-brand-ink">Encrypted sensitive docs</p>
              <p className="mt-1 text-sm text-slate-500">Credit reports are metadata-only unless an encrypted storage path and key reference exist.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Secure Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
              Drag borrower documents here or use the upload action. Files should be written to the private Supabase Storage bucket and linked through `secure_documents`.
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <label className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
                <span>Contains PII</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
                <span>Encrypted at rest</span>
              </label>
              <label className="block">
                <span className="font-medium text-slate-700">Encryption key reference</span>
                <input className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20" placeholder="kms/source-one/borrower-docs" />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModulePage
        title="Uploaded Files"
        description="Current document requests, uploaded borrower files, encryption status, and storage paths."
        actionLabel="Request File"
        columns={["Borrower", "Loan", "File Type", "Status", "PII", "Encrypted", "Storage Path"]}
        rows={[
          { Borrower: "Maya Henderson", Loan: "Bank Statement", "File Type": "Business bank statements", Status: "Uploaded", PII: "Yes", Encrypted: "Yes", "Storage Path": "maya/bank-statements.pdf" },
          { Borrower: "Chris Morgan", Loan: "VA", "File Type": "Certificate of Eligibility", Status: "Accepted", PII: "Yes", Encrypted: "Yes", "Storage Path": "chris/coe.pdf" },
          { Borrower: "Nadia Patel", Loan: "DSCR", "File Type": "Credit report metadata", Status: "Metadata only", PII: "Yes", Encrypted: "Required", "Storage Path": "encrypted reference only" }
        ]}
      />
    </div>
  );
}
