import { TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandedLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
  variant?: 'spinner' | 'pulse' | 'resonance';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8', 
  lg: 'h-16 w-16',
  xl: 'h-32 w-32'
};

const messageSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base', 
  xl: 'text-lg'
};

export function BrandedLoader({ 
  size = 'md', 
  message = 'Loading...', 
  className,
  variant = 'resonance' 
}: BrandedLoaderProps) {
  
  if (variant === 'spinner') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <div className={cn(
          "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
          sizeClasses[size]
        )} />
        {message && (
          <p className={cn("text-muted-foreground font-medium", messageSizes[size])}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className={cn(
          "bg-gradient-resonance rounded-full animate-pulse opacity-60",
          sizeClasses[size]
        )} />
        {message && (
          <p className={cn("text-muted-foreground font-medium animate-pulse", messageSizes[size])}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // Resonance branded loader
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
          size === 'xl' ? 'h-32 w-32' : size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-8 w-8' : 'h-4 w-4'
        )} />
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp className={cn(
            "text-primary animate-pulse",
            size === 'xl' ? 'h-8 w-8' : size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
          )} />
        </div>
      </div>
      
      {message && (
        <div className="text-center space-y-1">
          <p className={cn("text-muted-foreground font-medium", messageSizes[size])}>
            {message}
          </p>
          <p className={cn(
            "text-primary/60 font-semibold tracking-wide",
            size === 'xl' ? 'text-sm' : size === 'lg' ? 'text-xs' : 'text-xs'
          )}>
            Resonance Executive Coaching
          </p>
        </div>
      )}
    </div>
  );
}