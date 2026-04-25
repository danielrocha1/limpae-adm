import React, { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  MailCheck,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDeleteUser, useUsers } from "../hooks/useUsers";
import Modal from "../components/Modal";
import UserEditForm from "../components/UserEditForm";
import { useToast } from "../components/Toast";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import {
  formatFieldValue,
  getUserEmail,
  getUserId,
  getUserName,
  getUserRole,
  getValue,
  isUserInRole,
  tableUserFields,
} from "../lib/schema";

const pageSize = 10;

function roleLabel(roleFilter) {
  if (roleFilter === "cliente") return "Clientes";
  if (roleFilter === "diarista") return "Diaristas";
  return "Usuarios";
}

function statValue(users, kind) {
  if (kind === "verified") return users.filter((user) => Boolean(getValue(user, "EmailVerified"))).length;
  return users.length;
}

export default function UsersListPage({ roleFilter = "todos" }) {
  const { data: users = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortField, setSortField] = useState("Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const columns = useMemo(() => tableUserFields(), []);
  const title = roleLabel(roleFilter);

  const roleUsers = useMemo(() => users.filter((user) => isUserInRole(user, roleFilter)), [roleFilter, users]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return roleUsers
      .filter((user) => {
        if (statusFilter === "verificados") return Boolean(getValue(user, "EmailVerified"));
        if (statusFilter === "pendentes") return !Boolean(getValue(user, "EmailVerified"));
        return true;
      })
      .filter((user) => {
        const haystack = [getUserName(user), getUserEmail(user), getValue(user, "Cpf"), getValue(user, "Phone")]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => {
        const left = String(getValue(a, sortField) ?? "");
        const right = String(getValue(b, sortField) ?? "");
        return sortDirection === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      });
  }, [roleUsers, search, sortDirection, sortField, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const verifiedCount = statValue(roleUsers, "verified");
  const pendingCount = Math.max(roleUsers.length - verifiedCount, 0);

  function toggleSort(field) {
    if (sortField === field.name) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field.name);
      setSortDirection("asc");
    }
  }

  async function handleDelete(user) {
    const id = getUserId(user);
    if (!window.confirm(`Excluir ${getUserName(user)}?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      addToast("Usuario excluido com sucesso.", "success");
    } catch (err) {
      addToast(err.message || "Nao foi possivel excluir o usuario.", "error");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">Gestao de usuarios</Badge>
              <Badge variant="outline">Schema Go User</Badge>
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-normal">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Controle de cadastro, verificacao, papel de acesso e dados essenciais. A tabela usa os campos extraidos dos models do backend.
            </p>
          </div>
          <Button className="h-11 bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-950" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo usuario
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-slate-50 p-4 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <Users className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-3 text-3xl font-black">{roleUsers.length}</p>
          </div>
          <div className="rounded-lg border bg-teal-50 p-4 text-teal-950 dark:bg-teal-500/10 dark:text-teal-200">
            <div className="flex items-center justify-between">
              <span className="text-sm">Verificados</span>
              <MailCheck className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-black">{verifiedCount}</p>
          </div>
          <div className="rounded-lg border bg-rose-50 p-4 text-rose-950 dark:bg-rose-500/10 dark:text-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pendentes</span>
              <UserRound className="h-4 w-4" />
            </div>
            <p className="mt-3 text-3xl font-black">{pendingCount}</p>
          </div>
        </div>
      </section>

      <Card className="border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-lg pl-10"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, email, CPF ou telefone"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Status
            </span>
            {[
              ["todos", "Todos"],
              ["verificados", "Verificados"],
              ["pendentes", "Pendentes"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${
                  statusFilter === value
                    ? "bg-slate-950 text-white dark:bg-teal-400 dark:text-slate-950"
                    : "border bg-background hover:bg-secondary"
                }`}
                onClick={() => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-white/[0.04]">
                {columns.map((field) => (
                  <th key={field.name} className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <button className="inline-flex items-center gap-2 hover:text-foreground" onClick={() => toggleSort(field)}>
                      {field.name}
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                  </th>
                ))}
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleUsers.map((user) => (
                <tr key={getUserId(user)} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                  {columns.map((field) => {
                    const value = getValue(user, field.name);
                    if (field.name === "Name") {
                      return (
                        <td key={field.name} className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-slate-100 text-xs font-black text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                              {getValue(user, "Photo") ? (
                                <img src={getValue(user, "Photo")} alt="" className="h-full w-full object-cover" />
                              ) : (
                                getUserName(user).slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-bold">{getUserName(user)}</p>
                              <p className="truncate text-xs text-muted-foreground">{getUserEmail(user)}</p>
                            </div>
                          </div>
                        </td>
                      );
                    }
                    if (field.name === "Email") {
                      return <td key={field.name} className="px-5 py-4 text-muted-foreground">{getUserEmail(user)}</td>;
                    }
                    if (field.name === "Role") {
                      return (
                        <td key={field.name} className="px-5 py-4">
                          <Badge className={getUserRole(user) === "diarista" ? "bg-teal-500/10 text-teal-700 dark:text-teal-300" : "bg-sky-500/10 text-sky-700 dark:text-sky-300"}>
                            {getUserRole(user) || "-"}
                          </Badge>
                        </td>
                      );
                    }
                    if (field.name === "EmailVerified") {
                      return (
                        <td key={field.name} className="px-5 py-4">
                          <Badge variant={value ? "success" : "warning"}>{value ? "Verificado" : "Pendente"}</Badge>
                        </td>
                      );
                    }
                    return <td key={field.name} className="px-5 py-4 text-muted-foreground">{formatFieldValue(value, field)}</td>;
                  })}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/usuarios/${getUserId(user)}`}
                        title="Ver detalhes"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-secondary"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Button variant="outline" size="icon" title="Editar" className="h-9 w-9 rounded-lg" onClick={() => setEditingUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="Excluir" className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-slate-50/70 p-4 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {visibleUsers.length} de {filteredUsers.length} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="rounded-lg border bg-background px-3 py-2 text-sm font-semibold">Pagina {page} de {totalPages}</span>
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Editar usuario">
        <UserEditForm user={editingUser} defaultRole={roleFilter} onSuccess={() => setEditingUser(null)} />
      </Modal>
      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Novo usuario">
        <UserEditForm defaultRole={roleFilter} onSuccess={() => setCreating(false)} />
      </Modal>
    </div>
  );
}
