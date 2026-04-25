import React, { useMemo, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { formatFieldValue, getUserEmail, getUserId, getUserName, getUserRole, getValue, isUserInRole, tableUserFields } from "../lib/schema";

const pageSize = 10;

export default function UsersListPage({ roleFilter = "todos" }) {
  const { data: users = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const columns = useMemo(() => tableUserFields(), []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users
      .filter((user) => isUserInRole(user, roleFilter))
      .filter((user) => {
        const haystack = [getUserName(user), getUserEmail(user), getValue(user, "Cpf"), getValue(user, "Phone")].join(" ").toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => {
        const left = String(getValue(a, sortField) ?? "");
        const right = String(getValue(b, sortField) ?? "");
        return sortDirection === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      });
  }, [roleFilter, search, sortDirection, sortField, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const title = roleFilter === "cliente" ? "Clientes" : roleFilter === "diarista" ? "Diaristas" : "Usuarios";

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
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Tabelas, formularios e detalhes gerados a partir do model Go User.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Novo usuario
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nome, email, CPF ou telefone" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-secondary/50">
              <tr>
                {columns.map((field) => (
                  <th key={field.name} className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                    <button className="inline-flex items-center gap-2" onClick={() => toggleSort(field)}>
                      {field.name}
                      <ArrowDownUp className="h-3 w-3" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleUsers.map((user) => (
                <tr key={getUserId(user)} className="hover:bg-secondary/30">
                  {columns.map((field) => {
                    const value = getValue(user, field.name);
                    if (field.name === "Name") {
                      return (
                        <td key={field.name} className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-md bg-primary/10 text-xs font-bold text-primary">
                              {getValue(user, "Photo") ? <img src={getValue(user, "Photo")} alt="" className="h-full w-full object-cover" /> : getUserName(user).slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{getUserName(user)}</span>
                          </div>
                        </td>
                      );
                    }
                    if (field.name === "Role") {
                      return <td key={field.name} className="px-4 py-3"><Badge>{getUserRole(user) || "-"}</Badge></td>;
                    }
                    if (field.name === "EmailVerified") {
                      return <td key={field.name} className="px-4 py-3"><Badge variant={value ? "success" : "warning"}>{value ? "Verificado" : "Pendente"}</Badge></td>;
                    }
                    return <td key={field.name} className="px-4 py-3 text-muted-foreground">{formatFieldValue(value, field)}</td>;
                  })}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/usuarios/${getUserId(user)}`}
                        title="Ver detalhes"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditingUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir" className="text-destructive" onClick={() => handleDelete(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{filteredUsers.length} resultados encontrados</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Pagina {page} de {totalPages}</span>
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
