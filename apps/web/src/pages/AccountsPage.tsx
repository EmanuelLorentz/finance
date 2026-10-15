import { useState } from 'react';
import { Landmark, Plus } from 'lucide-react';
import type { Account, CreateAccountData } from '@finance/shared';
import { CreateAccountForm } from '../components/accounts/CreateAccountForm';
import { Modal } from '../components/ui/Modal';
import { useAccounts } from '../hooks/useAccounts';

export function AccountsPage() {
  const { accounts, isLoading, hasError, isSubmitting, addAccount, removeAccount } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function handleCreate(data: CreateAccountData) {
    setFormError('');
    try {
      await addAccount(data);
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  }

  async function handleDelete() {
    if (!accountToDelete) return;
    setDeleteError('');
    try {
      await removeAccount(accountToDelete.id);
      setAccountToDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível excluir a conta.');
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
        <p className="text-negative text-sm">Erro ao carregar contas.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-primary">Contas</h1>
          <p className="text-xs text-secondary mt-0.5">Contas usadas nas transactions</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150"
        >
          <Plus size={15} />
          Nova conta
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
          <Landmark size={40} className="text-muted mb-4" strokeWidth={1.25} />
          <p className="text-sm text-secondary mb-1">Nenhuma conta cadastrada</p>
          <p className="text-xs text-muted">Crie uma conta para usá-la ao registrar uma Transaction.</p>
        </div>
      ) : (
        <ul className="border border-border rounded-xl overflow-hidden bg-surface">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0"
            >
              <span className="text-sm text-primary truncate">{account.name}</span>
              <button
                type="button"
                onClick={() => {
                  setDeleteError('');
                  setAccountToDelete(account);
                }}
                className="text-xs text-negative hover:underline"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova conta">
        {formError && <p className="mb-4 text-xs text-negative">{formError}</p>}
        <CreateAccountForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={accountToDelete !== null}
        onClose={() => {
          if (!isSubmitting) setAccountToDelete(null);
        }}
        title="Excluir conta"
      >
        <p className="text-sm text-secondary">Excluir {accountToDelete?.name}?</p>
        {deleteError && <p className="mt-3 text-xs text-negative">{deleteError}</p>}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setAccountToDelete(null)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-150 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-negative border border-negative/40 rounded-lg hover:bg-negative/10 transition-colors duration-150 disabled:opacity-50"
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
}
