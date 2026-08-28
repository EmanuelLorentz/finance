import type { DashboardData } from '@finance/shared';
import { httpClient } from './httpClient';

export async function fetchDashboardData(): Promise<DashboardData> {
  return httpClient.get<DashboardData>('/dashboard');
}
