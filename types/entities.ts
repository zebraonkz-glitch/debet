export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  finished: boolean;
  liked: boolean;
  dd: Coordinates | null;
  date: string;
  amount: number;
  createdAt: string;
};

export type BudgetItem = {
  id: number;
  projectId: number;
  name: string;
  plannedAmount: number;
  order: number;
  createdAt: string;
};

export type Expense = {
  id: number;
  projectId: number;
  budgetItemId: number;
  amount: number;
  description: string;
  createdAt: string;
};

export type Executor = {
  id: number;
  name: string;
  phone: string;
  email: string;
  note: string;
};

export type Photo = {
  id: number;
  projectId: number;
  filePath: string;
  createdAt: string;
};

export type BudgetItemSummary = BudgetItem & {
  actualAmount: number;
  remainingAmount: number;
  isOverBudget: boolean;
};

export type ProjectBudgetSummary = {
  projectId: number;
  plannedTotal: number;
  actualTotal: number;
  remainingTotal: number;
  isOverBudget: boolean;
  items: BudgetItemSummary[];
  nextBudgetItem: BudgetItemSummary | null;
};
