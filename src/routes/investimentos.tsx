import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useFinance, formatBRL } from "@/lib/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/investimentos")({
  head: () => ({ meta: [{ title: "Investimentos" }] }),
  component: Page,
});

function Page() {
  const { investments, addInvestment } = useFinance();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const sorted = [...investments].sort(
    (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime(),
  );
  const current = sorted[0]?.total_amount ?? 0;
  const previous = sorted[1]?.total_amount ?? current;
  const delta = current - previous;
  const deltaPct = previous ? (delta / previous) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    addInvestment(value, note.trim() || undefined);
    setAmount("");
    setNote("");
    setLoading(false);
    toast.success("Carteira atualizada");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Investimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize o montante total da sua carteira e veja o histórico de aportes.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">Carteira atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-investment">
                <TrendingUp className="h-5 w-5" />
                <span className="text-4xl font-semibold tracking-tight">
                  {formatBRL(current)}
                </span>
              </div>
              {sorted.length > 1 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  {delta >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-income" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-expense" />
                  )}
                  <span className={delta >= 0 ? "text-income" : "text-expense"}>
                    {delta >= 0 ? "+" : ""}
                    {formatBRL(delta)} ({deltaPct.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground">desde o último registro</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Atualizar montante</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amt">Novo total (R$)</Label>
                  <Input
                    id="amt"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Observação</Label>
                  <Input
                    id="note"
                    placeholder="Ex: aporte mensal"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar atualização"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Histórico de aportes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Observação</th>
                  <th className="px-5 py-3 text-right font-medium">Total registrado</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((i) => (
                  <tr key={i.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(i.last_updated).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3">{i.note ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-medium text-investment">
                      {formatBRL(i.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
