import React from "react";
import { ArrowUpRight, CheckCircle2, Clock, MailCheck, ShieldCheck, UserRound, Users } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { getUserEmail, getUserName, getUserRole } from "../lib/schema";

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function DashboardPage() {
  const { data: users = [], isLoading } = useUsers();
  const total = Array.isArray(users) ? users.length : 0;
  const clients = users.filter((user) => getUserRole(user) === "cliente").length;
  const diarists = users.filter((user) => getUserRole(user) === "diarista").length;
  const verified = users.filter((user) => Boolean(user.EmailVerified ?? user.emailVerified)).length;
  const pending = Math.max(total - verified, 0);

  const stats = [
    { label: "Usuarios", value: total, detail: "Base total", icon: Users, tone: "bg-slate-950 text-white dark:bg-white dark:text-slate-950" },
    { label: "Clientes", value: clients, detail: `${percent(clients, total)}% da base`, icon: UserRound, tone: "bg-sky-500 text-white" },
    { label: "Diaristas", value: diarists, detail: `${percent(diarists, total)}% da base`, icon: ShieldCheck, tone: "bg-teal-500 text-slate-950" },
    { label: "Verificados", value: verified, detail: `${pending} pendentes`, icon: MailCheck, tone: "bg-rose-500 text-white" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border bg-slate-950 text-white shadow-xl dark:border-white/10">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.6fr] lg:p-8">
          <div>
            <Badge className="bg-teal-400/15 text-teal-200">Painel administrativo</Badge>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-normal md:text-5xl">
              Controle de usuarios com dados vindos dos models Go.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              A operacao de clientes e diaristas fica concentrada em uma interface responsiva, com schema gerado a partir do backend e consumo dos endpoints REST existentes.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Cobertura de verificacao</span>
              <span className="text-2xl font-black">{percent(verified, total)}%</span>
            </div>
            <div className="mt-5 h-3 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal-300" style={{ width: `${percent(verified, total)}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.07] p-3">
                <p className="text-slate-400">Verificados</p>
                <p className="mt-1 text-2xl font-bold">{verified}</p>
              </div>
              <div className="rounded-lg bg-white/[0.07] p-3">
                <p className="text-slate-400">Pendentes</p>
                <p className="mt-1 text-2xl font-bold">{pending}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-4xl font-black">{stat.value}</p>
                  </div>
                  <div className={`grid h-11 w-11 place-items-center rounded-lg ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">{stat.detail}</span>
                  <ArrowUpRight className="h-4 w-4 text-teal-500" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-bold">Cadastros recentes</h2>
              <p className="text-sm text-muted-foreground">Ultimos usuarios retornados por GET /users</p>
            </div>
            <Badge variant="outline">{users.length} registros</Badge>
          </div>
          <div className="divide-y">
            {users.slice(0, 8).map((user) => (
              <div key={user.ID || user.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-700 dark:bg-white/10 dark:text-white">
                  {getUserName(user).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{getUserName(user)}</p>
                  <p className="truncate text-xs text-muted-foreground">{getUserEmail(user)}</p>
                </div>
                <Badge className={getUserRole(user) === "diarista" ? "bg-teal-500/10 text-teal-700 dark:text-teal-300" : "bg-sky-500/10 text-sky-700 dark:text-sky-300"}>
                  {getUserRole(user) || "sem role"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
          <div className="border-b p-5">
            <h2 className="text-lg font-bold">Integracao</h2>
            <p className="text-sm text-muted-foreground">Estado do painel gerado</p>
          </div>
          <div className="space-y-4 p-5 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-white/[0.05]">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-500" /> REST /users</span>
              <span className="font-semibold">ativo</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-white/[0.05]">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-sky-500" /> Schema Go</span>
              <span className="font-semibold">build-time</span>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Distribuicao</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Clientes</span><span>{percent(clients, total)}%</span></div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-sky-500" style={{ width: `${percent(clients, total)}%` }} /></div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Diaristas</span><span>{percent(diarists, total)}%</span></div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-teal-500" style={{ width: `${percent(diarists, total)}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
