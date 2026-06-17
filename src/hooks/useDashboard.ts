import { useState, useEffect } from 'react';
import type { DashboardData } from '../types/dashboard';
import { fetchDashboardData } from '../services/dashboardService';

interface UseDashboardResult {
  data: DashboardData | null;
  isLoading: boolean;
  hasError: boolean;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchDashboardData()
      .then((result) => {
        if (!cancelled) {
          setData(result);
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

  return { data, isLoading, hasError };
}
