import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "secondary";
}

export const StatsCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    default: "bg-card hover:shadow-lg",
    primary: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:shadow-xl",
    secondary: "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground hover:shadow-xl"
  };

  return (
    <Card className={`p-6 transition-all duration-300 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-2 ${variant === "default" ? "text-muted-foreground" : "opacity-90"}`}>
            {title}
          </p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {trend && (
            <p className={`text-xs ${variant === "default" ? "text-muted-foreground" : "opacity-75"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${variant === "default" ? "bg-muted" : "bg-white/20"}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
