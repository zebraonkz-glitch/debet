import type { Coordinates } from './entities';

export type CreateProjectInput = {
  name: string;
  description?: string;
  finished?: boolean;
  liked?: boolean;
  dd?: Coordinates | null;
  date?: string;
  amount?: number;
  createdAt?: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateExpenseInput = {
  projectId: number;
  amount: number;
  description?: string;
  createdAt?: string;
};

export type UpdateExpenseInput = {
  projectId?: number;
  amount?: number;
  description?: string;
  createdAt?: string;
};

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
