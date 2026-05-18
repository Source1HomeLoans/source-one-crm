import { FileText, Mail, MessageSquareText, Phone, RefreshCw, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity, ActivityType } from "@/lib/data/activity";

const typeConfig: Record<ActivityType, { tone: "blue" | "green" | "gold" | "red" | "slate"; icon: LucideIcon }> = {
  Call: { tone: "green", icon: Phone },
  "Text Message": { tone: "blue", icon: MessageSquareText },
  Email: { tone: "gold", icon: Mail },
  Note: { tone: "slate", icon: FileText },
  "System Update": { tone: "red", icon: RefreshCw }
};

export function ActivityLog({ activities, title = "Communication Activity Log" }: { activities: Activity[]; title?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <Badge tone="blue">{activities.length}</Badge>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
            No activity has been logged yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const config = typeConfig[activity.activityType];
  const Icon = config.icon;

  return (
    <article className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={config.tone}>{activity.activityType}</Badge>
          <span className="text-xs text-slate-500">{activity.relatedContactType}</span>
          <span className="text-xs text-slate-500">{activity.timestamp}</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-brand-ink">{activity.relatedContact}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{activity.message}</p>
        <p className="mt-2 text-xs font-medium text-slate-500">Created by {activity.createdBy}</p>
      </div>
    </article>
  );
}
