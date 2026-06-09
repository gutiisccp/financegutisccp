import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFinance, formatBRL, type MealVoucherType } from "@/lib/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Utensils, Plus, Minus, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vale-refeicao")({
  head: () => ({
    meta: [
      { title: "Vale Refeição — Dashboard Financeiro" },
      { name: "description", content: "Controle de recargas e gastos do vale refeição." },
    ],
  }),
  component: () => (
    <AppShell>
      <ValeRefeicaoPage />
    </AppShell>
  ),
});

function ValeRefeicaoPage() {
  const { mealVoucher, mealVoucherBalance, addMealVoucherEntry } = useFinance();
  const [type, setType] = useState<MealVoucherType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const totals = useMemo(() => {
    const recharged = mealVoucher
      .filter((e) => e.type === "recharge")
      .reduce((s, e) => s + e.amount, 0);
    const spent = mealVoucher
      .filter((e) => e.type === "expense")
      .reduce((s, e) => s + e.amount, 0);
    return { recharged, spent };
  }, [mealVoucher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return;
    addMealVoucherEntry({
      type,
      amount: value,
      description: description || (type === "recharge" ? "Recarga" : "Refeição"),
      date: new Date(date).toISOString(),
    });
    setAmount("");
    setDescription("");
    toast.success(type === "recharge" ? "Recarga registrada" : "Gasto registrado");
  };

  const sorted = [...mealVoucher].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Vale Refeição</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Controle as recargas e os gastos do seu vale refeição.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wide">Saldo atual</span>
              <Wallet className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">
              {formatBRL(mealVoucherBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wide">Total recarregado</span>
              <Plus className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-income">
              {formatBRL(totals.recharged)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wide">Total gasto</span>
              <Minus className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-expense">
              {formatBRL(totals.spent)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Novo lançamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as MealVoucherType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="recharge">Recarga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={type === "recharge" ? "Recarga mensal" : "Almoço"}
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            {sorted.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 font-medium">Data</th>
                      <th className="pb-2 font-medium">Descrição</th>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((e) => (
                      <tr key={e.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 text-muted-foreground">
                          {new Date(e.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3">{e.description}</td>
                        <td className="py-3 text-muted-foreground">
                          {e.type === "recharge" ? "Recarga" : "Gasto"}
                        </td>
                        <td
                          className={
                            "py-3 text-right font-medium " +
                            (e.type === "recharge" ? "text-income" : "text-expense")
                          }
                        >
                          {e.type === "recharge" ? "+" : "-"}
                          {formatBRL(e.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <Utensils className="h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhum lançamento registrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
