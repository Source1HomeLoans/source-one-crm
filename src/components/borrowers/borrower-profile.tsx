import { CalendarClock, FileText, Mail, Phone, UserRound, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLog } from "@/components/activity/activity-log";
import { getActivitiesForContact } from "@/lib/data/activity";
import type { BorrowerProfile as BorrowerProfileData } from "@/lib/data/borrowers";
import { loanPrograms } from "@/lib/data/borrowers";
import { currency } from "@/lib/utils";

export function BorrowerProfile({ borrower }: { borrower: BorrowerProfileData }) {
  const activities = getActivitiesForContact(borrower.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-brand-ink">
              {borrower.firstName} {borrower.lastName}
            </h2>
            <Badge tone="green">{borrower.loanProgram.selected}</Badge>
            <Badge tone={borrower.consentToContact ? "blue" : "red"}>
              {borrower.consentToContact ? "Consent on file" : "No contact consent"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Assigned to {borrower.assignedLoanOfficer} · {borrower.state} · Preferred contact: {borrower.preferredContact}
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Info icon={Phone} label="Phone" value={borrower.phone} />
        <Info icon={Mail} label="Email" value={borrower.email} />
        <Info icon={UserRound} label="Credit" value={`${borrower.credit.estimatedScore} (${borrower.credit.scoreRange})`} />
        <Info icon={CalendarClock} label="Timeline" value={borrower.loanScenario.timeline} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <DetailCard title="Contact Information" rows={[
          ["Phone", borrower.phone],
          ["Email", borrower.email],
          ["State", borrower.state],
          ["Preferred contact", borrower.preferredContact],
          ["Assigned loan officer", borrower.assignedLoanOfficer]
        ]} />
        <DetailCard title="Loan Scenario" rows={[
          ["Purpose", borrower.loanScenario.purpose],
          ["Loan amount", currency(borrower.loanScenario.loanAmount)],
          ["Purchase price", currency(borrower.loanScenario.purchasePrice)],
          ["Down payment", currency(borrower.loanScenario.downPayment)],
          ["Occupancy", borrower.loanScenario.occupancy]
        ]} />
        <DetailCard title="Employment / Income" rows={[
          ["Employment type", borrower.employmentIncome.employmentType],
          ["Employer / business", borrower.employmentIncome.employerOrBusiness],
          ["Monthly income", currency(borrower.employmentIncome.monthlyIncome)],
          ["Income docs", borrower.employmentIncome.incomeDocumentation],
          ["History", borrower.employmentIncome.yearsInBusiness]
        ]} />
        <DetailCard title="Credit" rows={[
          ["Estimated score", borrower.credit.estimatedScore.toString()],
          ["Score range", borrower.credit.scoreRange],
          ["Liabilities", borrower.credit.liabilities],
          ["Late payments", borrower.credit.latePayments]
        ]} />
        <DetailCard title="Property Information" rows={[
          ["Address", borrower.property.address],
          ["Property type", borrower.property.propertyType],
          ["Units", borrower.property.units],
          ["Occupancy", borrower.property.occupancy],
          ["Estimated value", currency(borrower.property.estimatedValue)]
        ]} />
        <Card>
          <CardHeader>
            <CardTitle>Loan Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected</p>
              <p className="mt-1 text-lg font-semibold text-brand-ink">{borrower.loanProgram.selected}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{borrower.loanProgram.notes}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Available programs</p>
              <div className="flex flex-wrap gap-2">
                {loanPrograms.map((program) => (
                  <Badge key={program} tone={borrower.loanProgram.eligiblePrograms.includes(program) ? "green" : "slate"}>
                    {program}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ListCard title="Documents" items={borrower.documents.map((doc) => `${doc.name} · ${doc.status} · ${doc.updated}`)} />
        <ListCard title="Tasks" items={borrower.tasks.map((task) => `${task.title} · ${task.priority} · ${task.due} · ${task.status}`)} />
        <ListCard title="Notes" items={borrower.notes.map((note) => `${note.created} · ${note.author}: ${note.body}`)} />
        <ListCard
          title="Communication History"
          items={borrower.communications.map((item) => `${item.date} · ${item.channel} ${item.direction} · ${item.subject}: ${item.summary}`)}
        />
      </section>

      <ActivityLog activities={activities} title="Borrower Activity Log" />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-sm font-semibold text-brand-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <dt className="text-slate-500">{label}</dt>
              <dd className="max-w-[64%] text-right font-semibold text-brand-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              <FileText size={16} className="mt-1 shrink-0 text-brand-blue" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
