import React from "react";
import { CheckCircle2, Clock, UserRound, Users } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { getUserEmail, getUserName, getUserRole } from "../lib/schema";

export default function DashboardPage() {
  const { data: users = [], isLoading } = useUsers();
  const total = Array.isArray(users) ? users.length : 0;
  const clients = users.filter((user) => getUserRole(user) === "cliente").length;
  const diarists = users.filter((user) => getUserRole(user) === "diarista").length;
  const verified = users.filter((user) => Boolean(user.EmailVerified ?? user.emailVerified)).length;

  const stats = [
    { label: "Total de usuarios", value: total, icon: Users },
    { label: "Total de clientes", value: clients, icon: UserRound },
    { label: "Total de diaristas", value: diarists, icon: Users },
    { label: "Emails verificados", value: verified, icon: CheckCircle2 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visao operacional dos usuarios cadastrados na plataforma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cadastros recentes</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {users.slice(0, 8).map((user) => (
              <div key={user.ID || user.id} className="flex items-center gap-3 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                  {getUserName(user).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{getUserName(user)}</p>
                  <p className="truncate text-xs text-muted-foreground">{getUserEmail(user)}</p>
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs">{getUserRole(user) || "sem role"}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saude da integracao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> API de usuarios</span>
              <span className="text-muted-foreground">REST</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Schema dos models</span>
              <span className="text-muted-foreground">Gerado no build</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
