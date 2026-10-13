import { useState } from 'react';
import { ArrowLeftRight, Plus } from 'lucide-react';
import type { CreateTransactionData } from '@finance/shared';
import { CreateTransactionForm } from '../components/transactions/CreateTransactionForm';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useProjectsContext } from '../hooks/useProjectsContext';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/format';

const TYPE_LABELS = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
} as const;

export function TransactionsPage() {
  const { transactions, isLoading, hasError, isSubmitting, addTransaction } = useTransactions();
  const { projects } = useProjectsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleCreateTransaction(data: CreateTransactionData) {
    setSubmitError('');
    try {
      await addTransaction(data);
      setIsModalOpen(false);
    } catch {
      setSubmitError('Não foi possível salvar a Transaction. Verifique se a API está no ar.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-secondary text-sm">Carregando...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-negative text-sm">Erro ao carregar Transactions.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-primary">Transações</h1>
          <p className="text-xs text-secondary mt-0.5">
            Registre Income, Expense e Transfer
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitError('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150"
        >
          <Plus size={15} />
          Nova Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
          <ArrowLeftRight size={40} className="text-muted mb-4" strokeWidth={1.25} />
          <p className="text-sm text-secondary mb-1">Nenhuma Transaction registrada</p>
          <p className="text-xs text-muted mb-5">
            Crie a primeira Transaction para popular o Dashboard com dados reais
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150"
          >
            <Plus size={15} />
            Criar Primeira Transaction
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border bg-surface-raised/50">
                  <th className="px-4 py-3 text-xs font-medium text-secondary">Descrição</th>
                  <th className="px-4 py-3 text-xs font-medium text-secondary">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-secondary">Tipo</th>
                  <th className="px-4 py-3 text-xs font-medium text-secondary">Data</th>
                  <th className="px-4 py-3 text-xs font-medium text-secondary">Conta</th>
                  <th className="px-4 py-3 text-xs font-medium text-secondary text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm text-primary">{transaction.description}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{transaction.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant={transaction.type}>{TYPE_LABELS[transaction.type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{transaction.account}</td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold text-right ${
                        transaction.type === 'income'
                          ? 'text-accent'
                          : transaction.type === 'expense'
                            ? 'text-negative'
                            : 'text-secondary'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Transaction"
      >
        {submitError && (
          <p className="mb-4 text-xs text-negative">{submitError}</p>
        )}
        <CreateTransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
          projects={projects}
        />
      </Modal>
    </div>
  );
}
