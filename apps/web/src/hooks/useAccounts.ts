import { useCallback, useEffect, useState } from 'react';
import type { Account, CreateAccountData } from '@finance/shared';
import { createAccount, deleteAccount, fetchAccounts } from '../services/accountService';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setHasError(false);
    const data = await fetchAccounts();
    setAccounts(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchAccounts()
      .then((data) => {
        if (!cancelled) setAccounts(data);
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

  async function addAccount(data: CreateAccountData): Promise<Account> {
    setIsSubmitting(true);
    try {
      const created = await createAccount(data);
      setAccounts((prev) => [...prev, created].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')));
      return created;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeAccount(id: string): Promise<void> {
    setIsSubmitting(true);
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((account) => account.id !== id));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { accounts, isLoading, hasError, isSubmitting, addAccount, removeAccount, refresh };
}
