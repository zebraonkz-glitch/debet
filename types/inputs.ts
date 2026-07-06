import type { Coordinates } from './entities';

export type CreateProjectInput = {
  name: string;
  description?: string;
  finished?: boolean;
  liked?: boolean;
  dd?: Coordinates | null;
  createdAt?: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateBudgetItemInput = {
  projectId: number;
  name: string;
  plannedAmount: number;
  order?: number;
  createdAt?: string;
};

export type UpdateBudgetItemInput = Partial<
  Omit<CreateBudgetItemInput, 'projectId'>
>;

export type CreateExpenseInput = {
  projectId: number;
  budgetItemId: number;
  amount: number;
  description?: string;
  createdAt?: string;
};

export type UpdateExpenseInput = Partial<
  Omit<CreateExpenseInput, 'projectId'>
>;

export type CreateExecutorInput = {
  name: string;
  phone?: string;
  email?: string;
  note?: string;
};

export type UpdateExecutorInput = Partial<CreateExecutorInput>;

export type CreatePhotoInput = {
  projectId: number;
  filePath: string;
  createdAt?: string;
};
