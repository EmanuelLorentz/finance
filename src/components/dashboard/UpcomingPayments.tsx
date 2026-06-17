import { AlertCircle } from 'lucide-react';
import type { UpcomingPayment } from '../../types/payment';
import { formatCurrency, formatShortDate } from '../../utils/format';
import { Card } from '../ui/Card';

function getDaysUntil(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
}

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  return (
    <Card title="Próximos Pagamentos">
      <div className="space-y-0">
        {payments.map((payment) => {
          const daysUntil = getDaysUntil(payment.dueDate);
          const isOverdue = daysUntil < 0;
          const isUrgent = daysUntil >= 0 && daysUntil <= 3;

          return (
            <div
              key={payment.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex flex-col gap-1 min-w-0 mr-3">
                <div className="flex items-center gap-1.5">
                  {(isOverdue || isUrgent) && (
                    <AlertCircle
                      size={13}
                      className={isOverdue ? 'text-negative shrink-0' : 'text-amber-400 shrink-0'}
                    />
                  )}
                  <span className="text-sm font-medium text-primary truncate">
                    {payment.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{formatShortDate(payment.dueDate)}</span>
                  <span
                    className={`text-xs ${
                      isOverdue
                        ? 'text-negative'
                        : isUrgent
                          ? 'text-amber-400'
                          : 'text-muted'
                    }`}
                  >
                    {isOverdue
                      ? `${Math.abs(daysUntil)}d atrasado`
                      : daysUntil === 0
                        ? 'hoje'
                        : `em ${daysUntil}d`}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary shrink-0">
                {formatCurrency(payment.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
