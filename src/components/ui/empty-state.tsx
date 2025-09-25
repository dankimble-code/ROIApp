import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  variant?: 'default' | 'subtle' | 'branded';
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className,
  variant = 'default' 
}: EmptyStateProps) {
  const baseClasses = "text-center py-12 px-6";
  
  const variantClasses = {
    default: "bg-background",
    subtle: "bg-muted/20",
    branded: "bg-gradient-card shadow-resonance"
  };

  return (
    <Card className={cn(
      baseClasses,
      variantClasses[variant],
      variant === 'branded' && 'resonance-pattern',
      className
    )}>
      {/* Icon */}
      {icon && (
        <div className={cn(
          "mx-auto mb-4",
          variant === 'branded' 
            ? "text-primary/60" 
            : "text-muted-foreground"
        )}>
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        variant === 'branded' 
          ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          : "text-foreground"
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Button 
          variant={action.variant || (variant === 'branded' ? 'default' : 'outline')} 
          onClick={action.onClick}
          className={cn(
            variant === 'branded' && 
            "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg transition-resonance"
          )}
        >
          {action.label}
        </Button>
      )}

      {/* Subtle branding */}
      {variant === 'branded' && (
        <div className="mt-6 pt-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground/60">
            Resonance Executive Coaching
          </p>
        </div>
      )}
    </Card>
  );
}