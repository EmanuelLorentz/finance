import type { DashboardData } from '../types/dashboard';
import { mockDashboardData } from '../mocks/dashboard';

// Stub for future REST API integration — replace body with: return api.get('/dashboard')
export async function fetchDashboardData(): Promise<DashboardData> {
  return Promise.resolve(mockDashboardData);
}
