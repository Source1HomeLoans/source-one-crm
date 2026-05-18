import { ModulePage } from "@/components/ui/module-page";
import { auditTrailRows, userActivityRows } from "@/lib/data/compliance";

export default function AuditLogsPage() {
  return (
    <div className="space-y-5">
      <ModulePage
        title="Lead & Loan Audit Trail"
        badge="Compliance"
        description="Review lead and loan changes captured by database audit triggers."
        actionLabel="Export Logs"
        columns={["Time", "Actor", "Entity", "Record", "Action", "Change"]}
        rows={auditTrailRows}
      />
      <ModulePage
        title="User Activity Tracking"
        description="Review sensitive access and workflow events by user."
        actionLabel="Export Activity"
        columns={["Time", "User", "Event", "Target", "IP"]}
        rows={userActivityRows}
      />
    </div>
  );
}
