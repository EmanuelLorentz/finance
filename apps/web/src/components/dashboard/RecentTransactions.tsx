import type { Transaction } from '@finance/shared';
import { formatCurrency, formatDate } from '../../utils/format';
import { transactionTypeLabel } from '../../utils/transactionTypeLabel';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card title="Últimas Movimentações">
      <div className="space-y-0">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="flex flex-col gap-1 min-w-0 mr-3">
              <span className="text-sm font-medium text-primary truncate">
                {transaction.description}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{formatDate(transaction.date)}</span>
                <Badge variant={transaction.type === 'income' ? 'income' : 'expense'}>
                  {transactionTypeLabel(transaction.type)}
                </Badge>
              </div>
            </div>
            <span
              className={`text-sm font-semibold shrink-0 ${
                transaction.type === 'income'
                  ? 'text-accent'
                  : transaction.type === 'expense'
                    ? 'text-negative'
                    : 'text-secondary'
              }`}
            >
              {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
