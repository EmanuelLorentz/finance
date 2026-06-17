import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h2 className="text-sm font-semibold text-primary">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
