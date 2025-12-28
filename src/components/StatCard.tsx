import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
  className?: string;
}

/**
 * StatCard Component
 *
 * Displays statistical information in a card format with icon, title, value,
 * and optional trend indicator and description.
 */
export const StatCard = ({
  title,
  value,
  icon,
  subtitle,
  description,
  trend,
  isLoading = false,
  className
}: StatCardProps) => {
  if (isLoading) {
    return (
      <div className={cn(
        "p-6 rounded-xl bg-card border border-border",
        "animate-fade-in",
        className
      )}>
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
          {description && <Skeleton className="h-3 w-32" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300",
        "animate-fade-in hover:shadow-md",
        className
      )}
      role="region"
      aria-labelledby={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2 rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend === 'up' && "bg-success/20 text-success",
              trend === 'down' && "bg-destructive/20 text-destructive",
              trend === 'neutral' && "bg-muted text-muted-foreground"
            )}
            aria-label={`Trend: ${trend}`}
          >
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>

      <div>
        <p
          id={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm text-muted-foreground mb-1 font-medium"
        >
          {title}
        </p>
        <p
          className="text-2xl font-bold text-foreground font-mono"
          aria-label={`${title}: ${value}`}
        >
          {value}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 opacity-75">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
