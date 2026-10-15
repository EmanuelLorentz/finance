import { useMemo, useRef, useState } from 'react';

export interface SearchSelectOption {
  id: string;
  label: string;
  color?: string;
}

interface SearchSelectProps {
  id: string;
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  invalid?: boolean;
}

export function SearchSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  emptyMessage,
  invalid = false,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const listId = `${id}-options`;
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!isOpen || normalized.length === 0 || normalized === value.toLocaleLowerCase('pt-BR')) {
      return options;
    }

    return options.filter((option) => option.label.toLocaleLowerCase('pt-BR').includes(normalized));
  }, [isOpen, options, query, value]);

  function selectOption(option: SearchSelectOption) {
    onChange(option.label);
    setQuery(option.label);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        value={isOpen ? query : value}
        placeholder={options.length === 0 ? emptyMessage : placeholder}
        disabled={options.length === 0}
        onClick={() => {
          setQuery('');
          setIsOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setIsOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          if (event.target.value.trim() !== value) onChange('');
        }}
        onBlur={() => {
          setIsOpen(false);
          setQuery(value);
        }}
        className={`w-full bg-surface-raised border rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-muted outline-none transition-colors duration-150 disabled:opacity-60 ${
          invalid ? 'border-negative' : 'border-border focus:border-accent'
        }`}
      />
      {isOpen && options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1"
        >
          {visibleOptions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted">Nenhuma opção encontrada</li>
          ) : (
            visibleOptions.map((option) => {
              const isSelected = option.label === value;
              return (
                <li key={option.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(option);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 ${
                      isSelected
                        ? 'bg-accent/10 text-accent'
                        : 'text-primary hover:bg-surface-raised'
                    }`}
                  >
                    {option.color && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
