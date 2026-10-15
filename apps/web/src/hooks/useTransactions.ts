import { useCallback, useEffect, useState } from 'react';
import type { CreateTransactionData, Transaction } from '@finance/shared';
import { createTransaction, deleteTransaction, fetchTransactions } from '../services/transactionService';

interface UseTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  hasError: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  addTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setHasError(false);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    fetchTransactions()
      .then((data) => {
        if (!cancelled) {
          setTransactions(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function addTransaction(data: CreateTransactionData): Promise<Transaction> {
    setIsSubmitting(true);
    try {
      const created = await createTransaction(data);
      setTransactions((prev) => [created, ...prev]);
      return created;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeTransaction(id: string): Promise<void> {
    setIsDeleting(true);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    transactions,
    isLoading,
    hasError,
    isSubmitting,
    isDeleting,
    addTransaction,
    removeTransaction,
    refresh,
  };
}
