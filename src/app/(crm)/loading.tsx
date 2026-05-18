import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <Card key={item}>
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
