import type { ReactNode } from 'react';

const VARIANT_CLASSES = {
  income: 'bg-accent/10 text-accent',
  expense: 'bg-negative/10 text-negative',
  transfer: 'bg-blue-500/10 text-blue-400',
  neutral: 'bg-surface-raised text-secondary',
} as const;

interface BadgeProps {
  variant: keyof typeof VARIANT_CLASSES;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
