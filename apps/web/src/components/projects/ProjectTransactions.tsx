import type { Transaction } from '@finance/shared';
import { formatCurrency, formatDate } from '../../utils/format';
import { transactionTypeLabel } from '../../utils/transactionTypeLabel';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface ProjectTransactionsProps {
  transactions: Transaction[];
}

export function ProjectTransactions({ transactions }: ProjectTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card title="Transações do Projeto">
        <p className="text-sm text-muted py-4 text-center">
          Nenhuma transação vinculada a este projeto.
        </p>
      </Card>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card title="Transações do Projeto">
      <div>
        {sorted.map((transaction) => (
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
                <span className="text-xs text-muted">{transaction.category}</span>
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
