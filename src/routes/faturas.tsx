import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFinance, formatBRL, type AccountId } from "@/lib/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/faturas")({
  head: () => ({ meta: [{ title: "Faturas" }] }),
  component: Page,
});

// Returns the [start, end) date range for a billing cycle that closes in
// the given (year, month) on closingDay. The cycle starts the day after
// the previous month's closing day.
function cycleWindow(year: number, month: number, closingDay: number) {
  const end = new Date(year, month, closingDay + 1); // exclusive
  const start = new Date(year, month - 1, closingDay + 1);
  return { start, end };
}

const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function Page() {
  const { accounts, transactions } = useFinance();
  const cards = accounts.filter((a) => a.id !== "main");

  // offset 0 = current cycle (the bill that will close this month or next)
  const [offset, setOffset] = useState(0);

  const today = new Date();
  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth(); // 0-indexed
  const refDate = new Date(baseYear, baseMonth + offset, 1);
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth();
  const monthLabel = `${MONTH_LABELS[refMonth]} de ${refYear}`;

  const billFor = (id: AccountId, closingDay: number) => {
    const { start, end } = cycleWindow(refYear, refMonth, closingDay);
    return transactions
      .filter((t) => {
        if (t.account_id !== id || t.type !== "expense") return false;
        const d = new Date(t.date);
        return d >= start && d < end;
      })
      .reduce((s, t) => s + t.amount, 0);
  };

  const txInCycle = (id: AccountId, closingDay: number) => {
    const { start, end } = cycleWindow(refYear, refMonth, closingDay);
    return transactions
      .filter((t) => {
        if (t.account_id !== id) return false;
        const d = new Date(t.date);
        return d >= start && d < end;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Faturas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe o uso do limite e o fechamento de cada cartão.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset((o) => o - 1)}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[160px] text-center text-sm font-medium capitalize">
              {monthLabel}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset((o) => o + 1)}
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {offset !== 0 && (
              <Button variant="ghost" size="sm" onClick={() => setOffset(0)}>
                Hoje
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {cards.map((c) => {
            const closingDay = c.closing_day ?? 1;
            const bill = billFor(c.id, closingDay);
            const pct = c.credit_limit ? Math.min(100, (bill / c.credit_limit) * 100) : 0;
            const recent = txInCycle(c.id, closingDay).slice(0, 5);
            const closeDate = new Date(refYear, refMonth, closingDay);
            return (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="text-base font-medium">{c.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Fecha em {closeDate.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-semibold tracking-tight text-expense">
                        {formatBRL(bill)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        de {formatBRL(c.credit_limit)}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-3 h-2" />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{pct.toFixed(0)}% utilizado</span>
                      <span>{formatBRL(c.credit_limit - bill)} disponível</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Movimentações da fatura
                    </h3>
                    {recent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem movimentações neste período.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {recent.map((t) => (
                          <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                            <div>
                              <div>{t.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {t.category} · {new Date(t.date).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                            <span className="font-medium text-expense">
                              -{formatBRL(t.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
