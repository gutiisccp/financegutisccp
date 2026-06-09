import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useFinance, formatBRL } from "@/lib/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Wallet, TrendingUp, CreditCard, Utensils } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Financeiro — Visão Geral" },
      { name: "description", content: "Acompanhe saldo, investimentos e faturas em um só lugar." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { transactions, accounts, investments, mealVoucherBalance } = useFinance();

  const inter = accounts.find((a) => a.id === "inter")!;
  const itau = accounts.find((a) => a.id === "itau")!;
  const accountsBalance = accounts.reduce((s, a) => s + a.current_balance, 0);

  // Total investido = soma do último registro de cada corretora (em BRL)
  const investmentsTotal = useMemo(() => {
    const latest = new Map<string, number>();
    [...investments]
      .sort((a, b) => new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime())
      .forEach((i) => latest.set(i.broker, i.total_amount));
    return Array.from(latest.values()).reduce((s, v) => s + v, 0);
  }, [investments]);

  const interBill = transactions
    .filter((t) => t.account_id === "inter" && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const itauBill = transactions
    .filter((t) => t.account_id === "itau" && t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const projectionData = useMemo(() => {
    const monthly: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = monthly[key] || { income: 0, expense: 0 };
      if (t.type === "income") monthly[key].income += t.amount;
      if (t.type === "expense") monthly[key].expense += t.amount;
    });

    const today = new Date();
    const months: { label: string; patrimonio?: number; projecao?: number }[] = [];
    let running = accountsBalance + investmentsTotal;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = monthly[key] || { income: 0, expense: 0 };
      running += m.income - m.expense;
      months.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        patrimonio: Math.round(running),
      });
    }

    const values = Object.values(monthly);
    const avgIncome = values.length ? values.reduce((s, v) => s + v.income, 0) / values.length : 0;
    const avgExpense = values.length ? values.reduce((s, v) => s + v.expense, 0) / values.length : 0;
    const delta = avgIncome - avgExpense;
    let proj = months[months.length - 1].patrimonio!;
    months[months.length - 1].projecao = proj;
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      proj += delta;
      months.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        projecao: Math.round(proj),
      });
    }
    return months;
  }, [transactions, accountsBalance, investmentsTotal]);

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const pieColors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "var(--color-muted-foreground)",
  ];

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Visão Geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo financeiro de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Saldo em contas"
          value={formatBRL(accountsBalance)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <SummaryCard
          label="Investimentos"
          value={formatBRL(investmentsTotal)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="investment"
        />
        <SummaryCard
          label={`Fatura ${inter.name}`}
          value={formatBRL(interBill)}
          icon={<CreditCard className="h-4 w-4" />}
          tone="expense"
        />
        <SummaryCard
          label={`Fatura ${itau.name}`}
          value={formatBRL(itauBill)}
          icon={<CreditCard className="h-4 w-4" />}
          tone="expense"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Projeção de patrimônio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {hasTransactions ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => formatBRL(v)}
                    />
                    <Line type="monotone" dataKey="patrimonio" stroke="var(--color-foreground)" strokeWidth={2} dot={false} name="Patrimônio" />
                    <Line type="monotone" dataKey="projecao" stroke="var(--color-investment)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projeção" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 opacity-40" />
                  <p className="text-sm">Adicione transações para ver a projeção.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {expensesByCategory.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => formatBRL(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Wallet className="h-8 w-8 opacity-40" />
                  <p className="text-sm">Nenhuma despesa registrada.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Transações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {recent.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Descrição</th>
                    <th className="pb-2 font-medium">Categoria</th>
                    <th className="pb-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3">{t.description}</td>
                      <td className="py-3 text-muted-foreground">{t.category}</td>
                      <td
                        className={
                          "py-3 text-right font-medium " +
                          (t.type === "income"
                            ? "text-income"
                            : t.type === "investment"
                              ? "text-investment"
                              : "text-expense")
                        }
                      >
                        {t.type === "expense" ? "-" : "+"}
                        {formatBRL(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <Wallet className="h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhuma transação cadastrada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "income" | "expense" | "investment";
}) {
  const toneClass =
    tone === "income"
      ? "text-income"
      : tone === "expense"
        ? "text-expense"
        : tone === "investment"
          ? "text-investment"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
          {icon}
        </div>
        <div className={"mt-3 text-2xl font-semibold tracking-tight " + toneClass}>{value}</div>
      </CardContent>
    </Card>
  );
}
