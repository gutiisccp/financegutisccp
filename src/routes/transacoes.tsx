import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useFinance, formatBRL } from "@/lib/finance-store";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/transacoes")({
  head: () => ({ meta: [{ title: "Transações" }] }),
  component: Page,
});

function Page() {
  const { transactions, accounts } = useFinance();
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sorted.length} movimentação{sorted.length === 1 ? "" : "s"} registrada{sorted.length === 1 ? "" : "s"}
          </p>
        </header>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Descrição</th>
                    <th className="px-5 py-3 font-medium">Categoria</th>
                    <th className="px-5 py-3 font-medium">Conta</th>
                    <th className="px-5 py-3 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t) => (
                    <tr key={t.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-3">{t.description}</td>
                      <td className="px-5 py-3 text-muted-foreground">{t.category}</td>
                      <td className="px-5 py-3 text-muted-foreground">{accName(t.account_id)}</td>
                      <td
                        className={
                          "px-5 py-3 text-right font-medium " +
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
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
