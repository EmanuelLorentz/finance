import { useState } from 'react';
import type { CreateTransactionData, Project, TransactionType } from '@finance/shared';

interface CreateTransactionFormProps {
  onSubmit: (data: CreateTransactionData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  projects?: Project[];
}

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CreateTransactionForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  projects = [],
}: CreateTransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayIsoDate);
  const [account, setAccount] = useState('');
  const [projectId, setProjectId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!description.trim()) nextErrors.description = 'A descrição é obrigatória.';
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      nextErrors.amount = 'Informe um valor válido.';
    }
    if (!category.trim()) nextErrors.category = 'A Category é obrigatória.';
    if (!date) nextErrors.date = 'A data é obrigatória.';
    if (!account.trim()) nextErrors.account = 'A conta é obrigatória.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const data: CreateTransactionData = {
      description: description.trim(),
      amount: parsedAmount,
      type,
      category: category.trim(),
      date,
      account: account.trim(),
      projectId: projectId || undefined,
    };
    onSubmit(data);
  }

  const inputClass =
    'w-full bg-surface-raised border border-border rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-muted outline-none focus:border-accent transition-colors duration-150';

  const labelClass = 'block text-xs font-medium text-secondary mb-1.5';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="transaction-description" className={labelClass}>
            Descrição <span className="text-negative">*</span>
          </label>
          <input
            id="transaction-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Mercado, Salário, Aluguel..."
            className={`${inputClass} ${errors.description ? 'border-negative' : ''}`}
            autoFocus
          />
          {errors.description && <p className="mt-1 text-xs text-negative">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="transaction-amount" className={labelClass}>
              Valor <span className="text-negative">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">R$</span>
              <input
                id="transaction-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className={`${inputClass} pl-8 ${errors.amount ? 'border-negative' : ''}`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-negative">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="transaction-date" className={labelClass}>
              Data <span className="text-negative">*</span>
            </label>
            <input
              id="transaction-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputClass} ${errors.date ? 'border-negative' : ''}`}
            />
            {errors.date && <p className="mt-1 text-xs text-negative">{errors.date}</p>}
          </div>
        </div>

        <div>
          <p className={labelClass}>Tipo <span className="text-negative">*</span></p>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                  type === option.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-surface-raised text-secondary hover:text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="transaction-category" className={labelClass}>
              Category <span className="text-negative">*</span>
            </label>
            <input
              id="transaction-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Alimentação"
              className={`${inputClass} ${errors.category ? 'border-negative' : ''}`}
            />
            {errors.category && <p className="mt-1 text-xs text-negative">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="transaction-account" className={labelClass}>
              Conta <span className="text-negative">*</span>
            </label>
            <input
              id="transaction-account"
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Ex: Conta corrente"
              className={`${inputClass} ${errors.account ? 'border-negative' : ''}`}
            />
            {errors.account && <p className="mt-1 text-xs text-negative">{errors.account}</p>}
          </div>
        </div>

        {projects.length > 0 && (
          <div>
            <label htmlFor="transaction-project" className={labelClass}>
              Projeto <span className="text-muted">(opcional)</span>
            </label>
            <select
              id="transaction-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={inputClass}
            >
              <option value="">Nenhum</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-150"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Transaction'}
        </button>
      </div>
    </form>
  );
}
