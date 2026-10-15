import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

interface TransactionActionsProps {
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDelete: () => void;
}

export function TransactionActions({
  description,
  isOpen,
  onToggle,
  onClose,
  onDelete,
}: TransactionActionsProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function placeMenu() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    document.documentElement.style.setProperty('--transaction-menu-top', `${rect.bottom + 4}px`);
    document.documentElement.style.setProperty('--transaction-menu-left', `${rect.right}px`);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    placeMenu();
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', placeMenu);
    window.addEventListener('scroll', placeMenu, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', placeMenu);
      window.removeEventListener('scroll', placeMenu, true);
    };
  }, [isOpen, onClose]);

  return (
    <div className="flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Opções de ${description}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          placeMenu();
          onToggle();
        }}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-secondary hover:text-primary hover:bg-surface-raised transition-colors duration-150"
      >
        <MoreHorizontal size={16} />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed top-[var(--transaction-menu-top)] left-[var(--transaction-menu-left)] z-50 min-w-36 -translate-x-full rounded-lg border border-border bg-surface py-1"
          >
            <button
              type="button"
              role="menuitem"
              onClick={onDelete}
              className="w-full px-3 py-2 text-left text-sm text-negative hover:bg-surface-raised transition-colors duration-150"
            >
              Excluir
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
