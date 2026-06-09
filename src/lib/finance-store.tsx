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

const today = new Date();
const daysAgo = (n: number) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() - n).toISOString();

const seedTransactions: Transaction[] = [
  { id: "t1", type: "income", amount: 8500, description: "Salário", category: "Salário", account_id: "main", date: daysAgo(2) },
  { id: "t2", type: "expense", amount: 320, description: "Supermercado", category: "Alimentação", account_id: "inter", date: daysAgo(3) },
  { id: "t3", type: "expense", amount: 89, description: "Uber", category: "Transporte", account_id: "itau", date: daysAgo(4) },
  { id: "t4", type: "expense", amount: 1800, description: "Aluguel", category: "Moradia", account_id: "main", date: daysAgo(5) },
  { id: "t5", type: "investment", amount: 1000, description: "Aporte CDB", category: "Outros", account_id: "main", date: daysAgo(6) },
  { id: "t6", type: "expense", amount: 145, description: "Cinema + jantar", category: "Lazer", account_id: "inter", date: daysAgo(7) },
  { id: "t7", type: "expense", amount: 230, description: "Farmácia", category: "Saúde", account_id: "itau", date: daysAgo(10) },
  { id: "t8", type: "expense", amount: 410, description: "Roupas", category: "Compras", account_id: "inter", date: daysAgo(12) },
];

const seedAccounts: Account[] = [
  { id: "main", name: "Conta Principal", current_balance: 12450, credit_limit: 0 },
  { id: "inter", name: "Banco Inter", current_balance: 0, credit_limit: 5000, closing_day: 25 },
  { id: "itau", name: "Banco Itaú", current_balance: 0, credit_limit: 8000, closing_day: 10 },
];

const seedInvestments: Investment[] = [
  { id: "i1", total_amount: 28500, last_updated: daysAgo(15), note: "Saldo inicial" },
  { id: "i2", total_amount: 29500, last_updated: daysAgo(6), note: "Aporte CDB" },
];

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
