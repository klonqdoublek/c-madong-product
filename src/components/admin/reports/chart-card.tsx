import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  minHeight?: number;
}

export function ChartCard({ title, children, loading, minHeight = 260 }: Props) {
  return (
    <Card className="shadow-sm border-slate-100">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {loading ? (
          <div
            className="animate-pulse rounded-xl bg-slate-100"
            style={{ height: minHeight }}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
