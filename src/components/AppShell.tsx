import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, CreditCard, TrendingUp, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "./AddTransactionDialog";

const nav = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/faturas", label: "Faturas", icon: CreditCard },
  { to: "/investimentos", label: "Investimentos", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border px-5 py-8 md:flex">
          <div className="mb-10 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground" />
            <span className="text-sm font-semibold tracking-tight">Finanças</span>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto">
            <Button className="w-full" onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" /> Nova transação
            </Button>
          </div>
        </aside>

        <main className="flex-1 px-5 py-8 md:px-10">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-foreground" />
              <span className="text-sm font-semibold">Finanças</span>
            </div>
            <Button size="sm" onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" /> Nova
            </Button>
          </div>
          <div className="mb-6 flex gap-1 overflow-x-auto md:hidden">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </main>
      </div>
      <AddTransactionDialog open={openAdd} onOpenChange={setOpenAdd} />
    </div>
  );
}
