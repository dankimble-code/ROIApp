import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BrandSectionProps {
  children: ReactNode;
  variant?: 'navy' | 'orange';
  className?: string;
}

export function BrandSection({ children, variant = 'navy', className }: BrandSectionProps) {
  return (
    <div className={cn(
      'p-6 rounded-lg',
      variant === 'navy' ? 'section-navy' : 'section-orange',
      className
    )}>
      {children}
    </div>
  );
}

interface BrandListProps {
  items: string[];
  variant?: 'navy' | 'orange';
  className?: string;
}

export function BrandList({ items, variant = 'navy', className }: BrandListProps) {
  return (
    <ul className={cn(
      'brand-list',
      variant === 'navy' ? 'brand-list-navy' : 'brand-list-orange',
      className
    )}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

interface BrandDividerProps {
  variant?: 'navy' | 'orange' | 'brand';
  className?: string;
}

export function BrandDivider({ variant = 'brand', className }: BrandDividerProps) {
  const variantClass = {
    navy: 'divider-navy',
    orange: 'divider-orange',
    brand: 'divider-brand'
  }[variant];

  return <div className={cn(variantClass, className)} />;
}

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  variant?: 'navy' | 'orange';
  className?: string;
}

export function MetricCard({ title, value, description, variant = 'navy', className }: MetricCardProps) {
  const borderClass = variant === 'navy' ? 'border-l-resonance-navy' : 'border-l-resonance-orange';
  const textClass = variant === 'navy' ? 'text-resonance-navy' : 'text-resonance-orange';

  return (
    <div className={cn(
      'bg-card rounded-lg p-6 border-l-4 shadow-sm',
      borderClass,
      className
    )}>
      <h3 className={cn('text-sm font-medium mb-2', textClass)}>
        {title}
      </h3>
      <div className="text-3xl font-bold text-foreground mb-1">
        {value}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}