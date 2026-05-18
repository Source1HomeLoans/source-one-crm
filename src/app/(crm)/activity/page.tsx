import { ActivityLog } from "@/components/activity/activity-log";
import { activities } from "@/lib/data/activity";

export const dynamic = "force-dynamic";

export default function ActivityPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-brand-ink">Communication Activity</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Track calls, text messages, emails, notes, and system updates across leads, borrowers, and referral partners.
        </p>
      </div>
      <ActivityLog activities={activities} />
    </div>
  );
}
