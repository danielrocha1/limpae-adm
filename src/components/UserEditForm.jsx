import React, { useEffect, useMemo, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useToast } from "./Toast";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { editableUserFields, getUserId, getValue, roleOptions } from "../lib/schema";

function initialValue(field, user) {
  const value = getValue(user, field.name);
  if (value !== undefined && value !== null) return field.input === "datetime" ? String(value).slice(0, 16) : value;
  if (field.name === "Role") return "cliente";
  if (field.input === "checkbox") return false;
  return "";
}

function castValue(field, value) {
  if (field.input === "checkbox") return Boolean(value);
  if (field.input === "number") return field.baseType === "float64" ? Number(value) : parseInt(value, 10) || 0;
  return value;
}

export default function UserEditForm({ user, defaultRole = "cliente", onSuccess }) {
  const fields = useMemo(() => editableUserFields(), []);
  const [formData, setFormData] = useState({});
  const updateMutation = useUpdateUser();
  const createMutation = useCreateUser();
  const { addToast } = useToast();
  const isEditing = Boolean(user);
  const isSaving = updateMutation.isPending || createMutation.isPending;

  useEffect(() => {
    const next = {};
    fields.forEach((field) => {
      next[field.name] = initialValue(field, user);
    });
    if (!user && next.Role !== undefined) next.Role = defaultRole === "todos" ? "cliente" : defaultRole;
    setFormData(next);
  }, [defaultRole, fields, user]);

  function handleChange(field, value) {
    setFormData((current) => ({ ...current, [field.name]: value }));
  }

  function handlePhotoFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData((current) => ({ ...current, Photo: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = fields.reduce((acc, field) => {
      acc[field.name] = castValue(field, formData[field.name]);
      return acc;
    }, {});

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: getUserId(user), data: payload });
        addToast("Usuario atualizado com sucesso.", "success");
      } else {
        await createMutation.mutateAsync(payload);
        addToast("Usuario criado com sucesso.", "success");
      }
      onSuccess?.();
    } catch (err) {
      addToast(err.message || "Nao foi possivel salvar o usuario.", "error");
    }
  }

  return (
    <form id="user-edit-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border bg-slate-50 p-4 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-white/10">
          {formData.Photo ? <img src={formData.Photo} alt="" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-muted-foreground" />}
        </div>
        <div>
          <p className="text-sm font-bold">Imagem de perfil</p>
          <p className="mt-1 text-xs text-muted-foreground">Campo Photo do model User. Use imagem local ou URL salva pela API.</p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-secondary dark:bg-white/5">
            <Camera className="h-4 w-4" />
            Upload de imagem
            <input className="sr-only" type="file" accept="image/*" onChange={handlePhotoFile} />
          </label>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          if (field.name === "Photo") return null;
          if (field.name === "Role") {
            return (
              <label key={field.name} className="space-y-2 text-sm font-semibold">
                <span>{field.name}</span>
                <select
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={formData[field.name] || ""}
                  onChange={(event) => handleChange(field, event.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (field.input === "checkbox") {
            return (
              <label key={field.name} className="flex h-11 items-center gap-3 self-end rounded-lg border bg-slate-50 px-3 text-sm font-semibold dark:bg-white/[0.04]">
                <input
                  type="checkbox"
                  checked={Boolean(formData[field.name])}
                  onChange={(event) => handleChange(field, event.target.checked)}
                />
                {field.name}
              </label>
            );
          }

          return (
            <label key={field.name} className="space-y-2 text-sm font-semibold">
              <span>{field.name}</span>
              <Input
                className="h-11 rounded-lg"
                type={field.input === "number" ? "number" : field.input === "email" ? "email" : "text"}
                value={formData[field.name] ?? ""}
                onChange={(event) => handleChange(field, event.target.value)}
                required={["Name", "Email", "Phone", "Cpf", "Role"].includes(field.name)}
              />
            </label>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 border-t pt-5">
        <Button className="h-11 rounded-lg bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-950" type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Salvar alteracoes" : "Criar usuario"}
        </Button>
      </div>
    </form>
  );
}
