export type User = {
  id: number;
  email: string;
  createdAt: string;
};

export type Category = {
  id: number;
  name: string;
  userId: number;
};

export type Expense = {
  id: number;
  amount: number;
  type: "PONCTUELLE" | "RECURRENTE";
  description?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
  categoryId?: number | null;
  category?: Category | null;
  userId: number;
};

export type Income = {
  id: number;
  amount: number;
  source: string;
  description?: string | null;
  date: string;
  createdAt: string;
  userId: number;
};
