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

export type Expense = {
  id: number;
  projectId: number;
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
