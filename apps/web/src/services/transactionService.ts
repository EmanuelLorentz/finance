import type { CreateTransactionData, Transaction } from '@finance/shared';
import { httpClient } from './httpClient';

export async function fetchTransactions(): Promise<Transaction[]> {
  return httpClient.get<Transaction[]>('/transactions');
}

export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  return httpClient.post<Transaction>('/transactions', data);
}
