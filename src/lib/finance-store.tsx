import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type TransactionType = "income" | "expense" | "investment";
export type AccountId = "main" | "inter" | "itau";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  account_id: AccountId;
  date: string; // ISO
}

export interface Account {
  id: AccountId;
  name: string;
  current_balance: number;
  credit_limit: number;
  closing_day?: number;
}

export interface Investment {
  id: string;
  total_amount: number;
  last_updated: string;
  note?: string;
}

export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Moradia",
  "Saúde",
  "Educação",
  "Compras",
  "Serviços",
  "Salário",
  "Outros",
];

const seedTransactions: Transaction[] = [];

const seedAccounts: Account[] = [
  { id: "main", name: "Conta Principal", current_balance: 0, credit_limit: 0 },
  { id: "inter", name: "Banco Inter", current_balance: 0, credit_limit: 6800, closing_day: 25 },
  { id: "itau", name: "Banco Itaú", current_balance: 0, credit_limit: 8570, closing_day: 10 },
];

const seedInvestments: Investment[] = [];

interface FinanceContextValue {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  addInvestment: (amount: number, note?: string) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [accounts] = useState<Account[]>(seedAccounts);
  const [investments, setInvestments] = useState<Investment[]>(seedInvestments);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      accounts,
      investments,
      addTransaction: (t) => {
        setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
      },
      addInvestment: (amount, note) => {
        setInvestments((prev) => [
          ...prev,
          { id: crypto.randomUUID(), total_amount: amount, last_updated: new Date().toISOString(), note },
        ]);
      },
    }),
    [transactions, accounts, investments],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
