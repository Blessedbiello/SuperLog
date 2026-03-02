import { clsx } from "clsx";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ variant = "text", className, width, height }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gray-200",
        variant === "text" && "h-4 w-full rounded",
        variant === "circle" && "h-10 w-10 rounded-full",
        variant === "rect" && "h-24 w-full rounded-lg",
        className
      )}
      style={{ width, height }}
    />
  );
}
