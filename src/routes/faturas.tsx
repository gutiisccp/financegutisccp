import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useFinance, formatBRL, type AccountId } from "@/lib/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/faturas")({
  head: () => ({ meta: [{ title: "Faturas" }] }),
  component: Page,
});

function Page() {
  const { accounts, transactions } = useFinance();
  const cards = accounts.filter((a) => a.id !== "main");

  const billFor = (id: AccountId) =>
    transactions
      .filter((t) => t.account_id === id && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Faturas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe o uso do limite e o fechamento de cada cartão.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {cards.map((c) => {
            const bill = billFor(c.id);
            const pct = c.credit_limit ? Math.min(100, (bill / c.credit_limit) * 100) : 0;
            const recent = transactions
              .filter((t) => t.account_id === c.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5);
            return (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="text-base font-medium">{c.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Fecha dia {c.closing_day ?? "—"}
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
                      Últimas movimentações
                    </h3>
                    {recent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem movimentações.</p>
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
