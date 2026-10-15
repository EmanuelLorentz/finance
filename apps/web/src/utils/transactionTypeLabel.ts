import type { TransactionType } from '@finance/shared';

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'income', label: 'Entrada' },
  { value: 'expense', label: 'Saída' },
] as const;

export function transactionTypeLabel(type: TransactionType): string {
  if (type === 'income') return 'Entrada';
  return 'Saída';
}
