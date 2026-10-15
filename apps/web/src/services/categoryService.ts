import type { Category, CreateCategoryData } from '@finance/shared';
import { httpClient } from './httpClient';

export async function fetchCategories(): Promise<Category[]> {
  return httpClient.get<Category[]>('/categories');
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  return httpClient.post<Category>('/categories', data);
}

export async function deleteCategory(id: string): Promise<void> {
  return httpClient.delete(`/categories/${id}`);
}
