import { clsx } from "clsx";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md";
  color?: "emerald" | "blue" | "amber" | "red";
  className?: string;
}

const colors = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export function Progress({
  value,
  max = 100,
  label,
  showPercent = true,
  size = "md",
  color = "emerald",
  className,
}: ProgressProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={clsx("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercent && <span className="text-sm text-gray-500">{percent}%</span>}
        </div>
      )}
      <div
        className={clsx(
          "w-full overflow-hidden rounded-full bg-gray-200",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        <div
          className={clsx("h-full rounded-full transition-all duration-300", colors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
