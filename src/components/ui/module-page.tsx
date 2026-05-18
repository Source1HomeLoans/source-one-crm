import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePageProps = {
  title: string;
  description: string;
  actionLabel: string;
  columns: string[];
  rows: Array<Record<string, string>>;
  badge?: string;
};

export function ModulePage({ title, description, actionLabel, columns, rows, badge }: ModulePageProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-brand-ink">{title}</h2>
            {badge ? <Badge tone="blue">{badge}</Badge> : null}
          </div>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>
        </div>
        <Button>
          <Plus size={17} />
          {actionLabel}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title} Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={`${title}-${index}`} className="hover:bg-slate-50">
                    {columns.map((column) => (
                      <td key={column} className="px-3 py-4 text-slate-700">
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
