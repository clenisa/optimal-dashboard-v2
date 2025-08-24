export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export interface Source {
  id: string;
  user_id: string;
  name: string;
  type: 'debit' | 'credit';
  current_balance: number;
  interest_rate?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  mode: 'debit' | 'credit';
  categories: Category;
  sources: Source;
}
