import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" className="h-8 w-32" />
      <Skeleton variant="rect" className="h-96" />
    </div>
  );
}
