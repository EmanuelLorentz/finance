import { useState } from 'react';
import type { CreateAccountData } from '@finance/shared';

interface CreateAccountFormProps {
  onSubmit: (data: CreateAccountData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateAccountForm({ onSubmit, onCancel, isSubmitting = false }: CreateAccountFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('O nome da conta é obrigatório.');
      return;
    }

    setError('');
    onSubmit({ name: name.trim() });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="account-name" className="block text-xs font-medium text-secondary mb-1.5">
        Nome <span className="text-negative">*</span>
      </label>
      <input
        id="account-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ex: Nubank"
        autoFocus
        className={`w-full bg-surface-raised border rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-muted outline-none focus:border-accent transition-colors duration-150 ${
          error ? 'border-negative' : 'border-border'
        }`}
      />
      {error && <p className="mt-1 text-xs text-negative">{error}</p>}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors duration-150 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Criar conta'}
        </button>
      </div>
    </form>
  );
}
