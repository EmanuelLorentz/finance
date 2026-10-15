import { useCallback, useEffect, useState } from 'react';
import type { Category, CreateCategoryData } from '@finance/shared';
import { createCategory, deleteCategory, fetchCategories } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setHasError(false);
    const data = await fetchCategories();
    setCategories(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function addCategory(data: CreateCategoryData): Promise<Category> {
    setIsSubmitting(true);
    try {
      const created = await createCategory(data);
      setCategories((prev) => [...prev, created].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')));
      return created;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeCategory(id: string): Promise<void> {
    setIsSubmitting(true);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { categories, isLoading, hasError, isSubmitting, addCategory, removeCategory, refresh };
}
