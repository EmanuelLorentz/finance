import { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import type { Category, CreateCategoryData } from '@finance/shared';
import { CreateCategoryForm } from '../components/categories/CreateCategoryForm';
import { Modal } from '../components/ui/Modal';
import { useCategories } from '../hooks/useCategories';

export function CategoriesPage() {
  const { categories, isLoading, hasError, isSubmitting, addCategory, removeCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function handleCreate(data: CreateCategoryData) {
    setFormError('');
    try {
      await addCategory(data);
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar a Category.');
    }
  }

  async function handleDelete() {
    if (!categoryToDelete) return;
    setDeleteError('');
    try {
      await removeCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Não foi possível excluir a Category.');
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
        <p className="text-negative text-sm">Erro ao carregar Categories.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-primary">Categorias</h1>
          <p className="text-xs text-secondary mt-0.5">Categories usadas nas transactions</p>
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
          Nova Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
          <Tag size={40} className="text-muted mb-4" strokeWidth={1.25} />
          <p className="text-sm text-secondary mb-1">Nenhuma Category cadastrada</p>
          <p className="text-xs text-muted">Crie uma Category para usá-la ao registrar uma Transaction.</p>
        </div>
      ) : (
        <ul className="border border-border rounded-xl overflow-hidden bg-surface">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-0"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                <span className="text-sm text-primary truncate">{category.name}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setDeleteError('');
                  setCategoryToDelete(category);
                }}
                className="text-xs text-negative hover:underline"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Category">
        {formError && <p className="mb-4 text-xs text-negative">{formError}</p>}
        <CreateCategoryForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={categoryToDelete !== null}
        onClose={() => {
          if (!isSubmitting) setCategoryToDelete(null);
        }}
        title="Excluir Category"
      >
        <p className="text-sm text-secondary">Excluir {categoryToDelete?.name}?</p>
        {deleteError && <p className="mt-3 text-xs text-negative">{deleteError}</p>}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setCategoryToDelete(null)}
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
