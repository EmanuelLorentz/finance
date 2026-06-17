import { useState, useEffect } from 'react';
import type { Project } from '../types/project';
import type { Transaction } from '../types/transaction';
import { fetchProjectById, fetchProjectTransactions } from '../services/projectService';

interface UseProjectResult {
  project: Project | null;
  transactions: Transaction[];
  isLoading: boolean;
  hasError: boolean;
}

export function useProject(id: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchProjectById(id), fetchProjectTransactions(id)])
      .then(([projectData, transactionsData]) => {
        if (!cancelled) {
          setProject(projectData);
          setTransactions(transactionsData);
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
  }, [id]);

  return { project, transactions, isLoading, hasError };
}
