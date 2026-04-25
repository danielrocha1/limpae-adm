import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Calendar, IdCard, Mail, Phone, ShieldCheck } from "lucide-react";
import { useUser } from "../hooks/useUsers";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import {
  formatFieldValue,
  getUserEmail,
  getUserName,
  getUserRole,
  getValue,
  profileSchemaForRole,
  userSchema,
} from "../lib/schema";

export default function UserDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading } = useUser(id);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-12 w-40" /><Skeleton className="h-[560px] w-full" /></div>;
  }

  const role = getUserRole(user);
  const profileSchema = profileSchemaForRole(role);
  const profile = role === "diarista" ? getValue(user, "DiaristProfile") : getValue(user, "UserProfile");
  const verified = Boolean(getValue(user, "EmailVerified"));

  return (
    <div className="space-y-6">
      <Link
        to={role === "diarista" ? "/diaristas" : "/clientes"}
        className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-white/10 text-2xl font-black ring-1 ring-white/20">
                {getValue(user, "Photo") ? (
                  <img src={getValue(user, "Photo")} alt="" className="h-full w-full object-cover" />
                ) : (
                  getUserName(user).slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-teal-400/15 text-teal-200">{role || "sem role"}</Badge>
                  <Badge className={verified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}>
                    {verified ? "Email verificado" : "Email pendente"}
                  </Badge>
                </div>
                <h1 className="mt-3 text-3xl font-black">{getUserName(user)}</h1>
                <p className="mt-1 text-sm text-slate-300">{getUserEmail(user)}</p>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-xs text-slate-400">Identificador</p>
              <p className="font-mono text-lg font-bold">#{id}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-4">
          {[
            ["Email", getUserEmail(user), Mail],
            ["Telefone", formatFieldValue(getValue(user, "Phone")), Phone],
            ["CPF", formatFieldValue(getValue(user, "Cpf")), IdCard],
            ["Criado em", formatFieldValue(getValue(user, "CreatedAt"), { input: "datetime" }), Calendar],
          ].map(([label, value, Icon]) => (
            <div key={label} className="border-b p-5 md:border-b-0 md:border-r md:last:border-r-0">
              <Icon className="mb-3 h-4 w-4 text-teal-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
          <div className="border-b p-5">
            <h2 className="text-lg font-bold">Campos do model User</h2>
            <p className="text-sm text-muted-foreground">Valores exibidos a partir do schema gerado dos models Go.</p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {(userSchema?.fields || []).filter((field) => !field.isRelation && !field.sensitive).map((field) => (
              <div key={field.name} className="rounded-lg border bg-slate-50 p-4 dark:bg-white/[0.04]">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{field.name}</p>
                <p className="mt-2 break-words text-sm font-semibold">{formatFieldValue(getValue(user, field.name), field)}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 bg-white p-5 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-500/10 text-teal-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold">Perfil operacional</h2>
                <p className="text-sm text-muted-foreground">{profileSchema?.name || "Sem perfil vinculado"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {profileSchema ? profileSchema.fields.filter((field) => !field.isRelation).map((field) => (
                <div key={field.name} className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">{field.name}</span>
                  <span className="text-right font-semibold">{formatFieldValue(getValue(profile, field.name), field)}</span>
                </div>
              )) : (
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">Nenhum schema de perfil para este role.</div>
              )}
            </div>
          </Card>

          <Card className="border-0 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-teal-300" />
              <h2 className="font-bold">Origem dos dados</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Esta tela consulta GET /users/:id e renderiza os campos conhecidos pelo schema local gerado a partir da pasta go.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
