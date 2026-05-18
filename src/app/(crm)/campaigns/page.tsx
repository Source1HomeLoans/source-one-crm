import { ModulePage } from "@/components/ui/module-page";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  return (
    <ModulePage
      title="Campaigns"
      badge="Marketing"
      description="Manage lead nurture, referral partner outreach, open house follow-up, and borrower reactivation campaigns."
      actionLabel="New Campaign"
      columns={["Campaign", "Audience", "Owner", "Status", "Leads", "Last Sent"]}
      rows={[
        { Campaign: "New Lead Speed-to-Contact", Audience: "New web leads", Owner: "Marketing", Status: "Active", Leads: "18", "Last Sent": "Today" },
        { Campaign: "Realtor Friday Recap", Audience: "VIP partners", Owner: "Marketing", Status: "Active", Leads: "12", "Last Sent": "May 15" },
        { Campaign: "Self-Employed Borrower Nurture", Audience: "Bank Statement / P&L", Owner: "Marketing", Status: "Draft", Leads: "9", "Last Sent": "Not sent" }
      ]}
    />
  );
}
