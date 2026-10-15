import type { Account, CreateAccountData } from '@finance/shared';
import { httpClient } from './httpClient';

export async function fetchAccounts(): Promise<Account[]> {
  return httpClient.get<Account[]>('/accounts');
}

export async function createAccount(data: CreateAccountData): Promise<Account> {
  return httpClient.post<Account>('/accounts', data);
}

export async function deleteAccount(id: string): Promise<void> {
  return httpClient.delete(`/accounts/${id}`);
}
