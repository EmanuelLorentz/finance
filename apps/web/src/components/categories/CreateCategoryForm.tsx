import { useState } from 'react';
import { PROJECT_COLORS, type CreateCategoryData } from '@finance/shared';

interface CreateCategoryFormProps {
  onSubmit: (data: CreateCategoryData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreateCategoryForm({ onSubmit, onCancel, isSubmitting = false }: CreateCategoryFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(PROJECT_COLORS[1]);
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('O nome da Category é obrigatório.');
      return;
    }

    setError('');
    onSubmit({ name: name.trim(), color });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="category-name" className="block text-xs font-medium text-secondary mb-1.5">
        Nome <span className="text-negative">*</span>
      </label>
      <input
        id="category-name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Ex: Alimentação"
        autoFocus
        className={`w-full bg-surface-raised border rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-muted outline-none focus:border-accent transition-colors duration-150 ${
          error ? 'border-negative' : 'border-border'
        }`}
      />
      {error && <p className="mt-1 text-xs text-negative">{error}</p>}

      <p className="block text-xs font-medium text-secondary mt-4 mb-1.5">Cor</p>
      <div className="flex gap-2">
        {PROJECT_COLORS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setColor(item)}
            className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
              color === item ? 'border-primary scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: item }}
            aria-label={`Cor ${item}`}
          />
        ))}
      </div>

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
          {isSubmitting ? 'Salvando...' : 'Criar Category'}
        </button>
      </div>
    </form>
  );
}
