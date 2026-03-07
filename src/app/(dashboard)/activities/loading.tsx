import { Skeleton } from "@/components/ui/skeleton";

export default function ActivitiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="rect" className="h-10 w-28" />
      </div>
      <Skeleton variant="rect" className="h-10 w-64" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-20" />
        ))}
      </div>
    </div>
  );
}
