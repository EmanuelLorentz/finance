import type { DashboardData } from '@finance/shared';
import { mockDashboardData } from '../mocks/dashboard';
import { httpClient } from './httpClient';

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    return await httpClient.get<DashboardData>('/dashboard');
  } catch {
    return mockDashboardData;
  }
}
