import type {
  BudgetItem,
  Coordinates,
  Executor,
  Expense,
  Photo,
  Project,
} from '../types/entities';

type ProjectRow = {
  id: number;
  name: string;
  description: string;
  visitlater: number;
  liked: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type BudgetItemRow = {
  id: number;
  project_id: number;
  name: string;
  planned_amount: number;
  sort_order: number;
  created_at: string;
};

type ExpenseRow = {
  id: number;
  project_id: number;
  budget_item_id: number;
  amount: number;
  description: string;
  created_at: string;
};

type ExecutorRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  note: string;
};

type PhotoRow = {
  id: number;
  project_id: number;
  file_path: string;
  created_at: string;
};

function mapCoordinates(
  latitude: number | null,
  longitude: number | null,
): Coordinates | null {
  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
}

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visitLater: row.visitlater === 1,
    liked: row.liked === 1,
    dd: mapCoordinates(row.latitude, row.longitude),
    createdAt: row.created_at,
  };
}

export function mapBudgetItem(row: BudgetItemRow): BudgetItem {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    plannedAmount: row.planned_amount,
    order: row.sort_order,
    createdAt: row.created_at,
  };
}

export function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    projectId: row.project_id,
    budgetItemId: row.budget_item_id,
    amount: row.amount,
    description: row.description,
    createdAt: row.created_at,
  };
}

export function mapExecutor(row: ExecutorRow): Executor {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    note: row.note,
  };
}

export function mapPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    projectId: row.project_id,
    filePath: row.file_path,
    createdAt: row.created_at,
  };
}

export type {
  BudgetItemRow,
  ExecutorRow,
  ExpenseRow,
  PhotoRow,
  ProjectRow,
};
