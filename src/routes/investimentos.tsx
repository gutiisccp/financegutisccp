import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  useFinance,
  formatBRL,
  formatUSD,
  BROKER_LABELS,
  type Broker,
} from "@/lib/finance-store";
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
import { TrendingUp, ArrowUpRight, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/investimentos")({
  head: () => ({ meta: [{ title: "Investimentos" }] }),
  component: Page,
});

function Page() {
  const { investments, addInvestment } = useFinance();
  const [broker, setBroker] = useState<Broker>("EQI");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // USD -> BRL rate
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<Date | null>(null);

  const fetchRate = async () => {
    setRateLoading(true);
    try {
      const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
      const data = await res.json();
      const bid = parseFloat(data?.USDBRL?.bid);
      if (!isFinite(bid)) throw new Error("invalid");
      setUsdRate(bid);
      setRateUpdatedAt(new Date());
    } catch {
      toast.error("Não foi possível obter a cotação do dólar");
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  // Latest entry per broker = current total of that broker
  const latestByBroker = new Map<Broker, typeof investments[number]>();
  [...investments]
    .sort((a, b) => new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime())
    .forEach((i) => latestByBroker.set(i.broker, i));

  const totalBRL = Array.from(latestByBroker.values()).reduce(
    (s, i) => s + i.total_amount,
    0,
  );

  // Recalcular crypto com taxa atual (se houver)
  const cryptoLatest = latestByBroker.get("Crypto");
  const cryptoOriginalUSD = cryptoLatest?.original_amount;
  const cryptoCurrentBRL =
    cryptoOriginalUSD && usdRate ? cryptoOriginalUSD * usdRate : cryptoLatest?.total_amount ?? 0;

  const sorted = [...investments].sort(
    (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime(),
  );

  const previewBRL = (() => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return null;
    if (broker === "Crypto") return usdRate ? value * usdRate : null;
    return value;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (broker === "Crypto" && !usdRate) {
      toast.error("Aguardando cotação do dólar");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    if (broker === "Crypto") {
      addInvestment({
        broker: "Crypto",
        total_amount: value * usdRate!,
        original_amount: value,
        currency: "USD",
        usd_rate: usdRate!,
        note: note.trim() || undefined,
      });
    } else {
      addInvestment({
        broker: "EQI",
        total_amount: value,
        currency: "BRL",
        note: note.trim() || undefined,
      });
    }
    setAmount("");
    setNote("");
    setLoading(false);
    toast.success("Carteira atualizada");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Investimentos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize o montante de cada corretora. Crypto é convertida com a cotação atual do dólar.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
            <span className="text-muted-foreground">USD/BRL</span>
            <span className="font-medium">
              {usdRate ? `R$ ${usdRate.toFixed(4)}` : "—"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={fetchRate}
              disabled={rateLoading}
              aria-label="Atualizar cotação"
            >
              <RefreshCw className={"h-3.5 w-3.5 " + (rateLoading ? "animate-spin" : "")} />
            </Button>
            {rateUpdatedAt && (
              <span className="text-muted-foreground">
                {rateUpdatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Carteira total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-investment">
                <TrendingUp className="h-5 w-5" />
                <span className="text-3xl font-semibold tracking-tight">
                  {formatBRL(
                    (latestByBroker.get("EQI")?.total_amount ?? 0) + cryptoCurrentBRL,
                  )}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Soma de Todos Investimentos
              </p>
            </CardContent>
          </Card>

          <BrokerCard
            label="EQI Investimentos"
            valueBRL={latestByBroker.get("EQI")?.total_amount ?? 0}
            lastUpdated={latestByBroker.get("EQI")?.last_updated}
          />

          <BrokerCard
            label="CryptoMoeda"
            valueBRL={cryptoCurrentBRL}
            lastUpdated={cryptoLatest?.last_updated}
            sub={
              cryptoOriginalUSD
                ? `${formatUSD(cryptoOriginalUSD)}${
                    usdRate ? ` × R$ ${usdRate.toFixed(4)}` : ""
                  }`
                : undefined
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Atualizar montante</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Corretora</Label>
                <Select value={broker} onValueChange={(v) => setBroker(v as Broker)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQI">{BROKER_LABELS.EQI}</SelectItem>
                    <SelectItem value="Crypto">{BROKER_LABELS.Crypto}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amt">
                  Novo total ({broker === "Crypto" ? "US$" : "R$"})
                </Label>
                <Input
                  id="amt"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {broker === "Crypto" && previewBRL !== null && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatBRL(previewBRL)}
                  </p>
                )}
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
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar atualização"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Histórico de aportes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Corretora</th>
                  <th className="px-5 py-3 font-medium">Observação</th>
                  <th className="px-5 py-3 text-right font-medium">Valor original</th>
                  <th className="px-5 py-3 text-right font-medium">Total em BRL</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Nenhum aporte registrado.
                    </td>
                  </tr>
                ) : (
                  sorted.map((i) => (
                    <tr key={i.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(i.last_updated).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-3">{BROKER_LABELS[i.broker]}</td>
                      <td className="px-5 py-3 text-muted-foreground">{i.note ?? "—"}</td>
                      <td className="px-5 py-3 text-right">
                        {i.currency === "USD" && i.original_amount
                          ? `${formatUSD(i.original_amount)}${
                              i.usd_rate ? ` @ R$${i.usd_rate.toFixed(4)}` : ""
                            }`
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-investment">
                        {formatBRL(i.total_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function BrokerCard({
  label,
  valueBRL,
  lastUpdated,
  sub,
}: {
  label: string;
  valueBRL: number;
  lastUpdated?: string;
  sub?: string;
}) {
  const sorted = [valueBRL]; // placeholder for potential delta later
  void sorted;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-investment">
          <ArrowUpRight className="h-5 w-5 opacity-0" />
          <span className="text-2xl font-semibold tracking-tight">{formatBRL(valueBRL)}</span>
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        {lastUpdated ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Atualizado em {new Date(lastUpdated).toLocaleDateString("pt-BR")}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Sem registros ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
