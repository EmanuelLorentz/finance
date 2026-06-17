import { useState } from 'react';
import { PROJECT_COLORS, type CreateProjectData } from '../../types/project';

interface CreateProjectFormProps {
  onSubmit: (data: CreateProjectData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_COLOR = PROJECT_COLORS[0];

export function CreateProjectForm({ onSubmit, onCancel, isSubmitting = false }: CreateProjectFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [impactsBalance, setImpactsBalance] = useState(true);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [nameError, setNameError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('O nome do projeto é obrigatório.');
      return;
    }
    setNameError('');

    const data: CreateProjectData = {
      name: name.trim(),
      description: description.trim() || undefined,
      budget: budget ? parseFloat(budget.replace(',', '.')) : undefined,
      deadline: deadline || undefined,
      impactsBalance,
      color,
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
          <label htmlFor="project-name" className={labelClass}>
            Nome <span className="text-negative">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Casamento, Reforma, Viagem..."
            className={`${inputClass} ${nameError ? 'border-negative' : ''}`}
            autoFocus
          />
          {nameError && <p className="mt-1 text-xs text-negative">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="project-description" className={labelClass}>
            Descrição <span className="text-muted">(opcional)</span>
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva brevemente o projeto..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="project-budget" className={labelClass}>
              Orçamento <span className="text-muted">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                R$
              </span>
              <input
                id="project-budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0,00"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-deadline" className={labelClass}>
              Prazo <span className="text-muted">(opcional)</span>
            </label>
            <input
              id="project-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className={labelClass}>Impacto no saldo total</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImpactsBalance(true)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                impactsBalance
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-surface-raised text-secondary hover:text-primary'
              }`}
            >
              Impacta o saldo
            </button>
            <button
              type="button"
              onClick={() => setImpactsBalance(false)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                !impactsBalance
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-surface-raised text-secondary hover:text-primary'
              }`}
            >
              Orçamento independente
            </button>
          </div>
        </div>

        <div>
          <p className={labelClass}>Cor de identificação</p>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
                  color === c ? 'border-primary scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>
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
          {isSubmitting ? 'Criando...' : 'Criar Projeto'}
        </button>
      </div>
    </form>
  );
}
