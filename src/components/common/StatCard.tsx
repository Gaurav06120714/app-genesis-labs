import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; up: boolean };
  warning?: boolean;
  className?: string;
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  trend,
  warning,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} aria-hidden="true" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.up ? "text-green-400" : "text-red-400"
            )}
            aria-label={`Trend: ${trend.value} ${trend.up ? "increase" : "decrease"}`}
          >
            {trend.up ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            )}
            {trend.value}
          </div>
        )}
        {warning && (
          <span className="w-2 h-2 rounded-full bg-red-400" aria-label="Warning indicator" role="img" />
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

export default StatCard;
