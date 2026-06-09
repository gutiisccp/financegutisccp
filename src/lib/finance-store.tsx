import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type TransactionType = "income" | "expense" | "investment";
export type AccountId = "inter" | "itau";
export type Broker = "EQI" | "Crypto";

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
  broker: Broker;
  total_amount: number; // valor total em BRL
  original_amount?: number; // valor original (ex: USD para crypto)
  currency?: "BRL" | "USD";
  usd_rate?: number; // taxa USD->BRL usada na conversão
  last_updated: string;
  note?: string;
}

export type MealVoucherType = "recharge" | "expense";

export interface MealVoucherEntry {
  id: string;
  type: MealVoucherType;
  amount: number;
  description: string;
  date: string; // ISO
}

export const BROKER_LABELS: Record<Broker, string> = {
  EQI: "EQI Investimentos",
  Crypto: "CryptoMoeda",
};

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
  { id: "inter", name: "Banco Inter", current_balance: 0, credit_limit: 6800, closing_day: 25 },
  { id: "itau", name: "Banco Itaú", current_balance: 0, credit_limit: 8570, closing_day: 10 },
];

const seedInvestments: Investment[] = [];

const seedMealVoucher: MealVoucherEntry[] = [];

interface FinanceContextValue {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  mealVoucher: MealVoucherEntry[];
  mealVoucherBalance: number;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  addInvestment: (i: Omit<Investment, "id" | "last_updated">) => void;
  addMealVoucherEntry: (e: Omit<MealVoucherEntry, "id">) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [accounts] = useState<Account[]>(seedAccounts);
  const [investments, setInvestments] = useState<Investment[]>(seedInvestments);
  const [mealVoucher, setMealVoucher] = useState<MealVoucherEntry[]>(seedMealVoucher);

  const mealVoucherBalance = useMemo(
    () =>
      mealVoucher.reduce(
        (s, e) => s + (e.type === "recharge" ? e.amount : -e.amount),
        0,
      ),
    [mealVoucher],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      accounts,
      investments,
      mealVoucher,
      mealVoucherBalance,
      addTransaction: (t) => {
        setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
      },
      addInvestment: (i) => {
        setInvestments((prev) => [
          ...prev,
          { ...i, id: crypto.randomUUID(), last_updated: new Date().toISOString() },
        ]);
      },
      addMealVoucherEntry: (e) => {
        setMealVoucher((prev) => [{ ...e, id: crypto.randomUUID() }, ...prev]);
      },
    }),
    [transactions, accounts, investments, mealVoucher, mealVoucherBalance],
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

export const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
